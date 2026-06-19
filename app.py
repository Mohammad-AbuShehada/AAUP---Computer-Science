from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import time
import os
import re
from difflib import SequenceMatcher
from dotenv import load_dotenv
from openai import OpenAI  

load_dotenv()

app = Flask(__name__)
DIST_DIR = os.path.join(app.root_path, "dist")
DIST_INDEX = os.path.join(DIST_DIR, "index.html")

SHEET_ID = "1eX0HjdZKYD9TvvavRWzL1uQ0sCFv_u_X-38vNholUeA"
CACHE_TIME = 60 * 60 * 8  # 8 hours

cache_links = {}
last_update = 0

HF_TOKEN = os.environ.get("HF_TOKEN", "").strip()   

client = None
if HF_TOKEN:
    client = OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=HF_TOKEN,
    )

# ------------------ TEXT HELPERS ------------------

def similarity(a, b):
    return SequenceMatcher(None, a, b).ratio()

def normalize_text(text):
    if text is None:
        return ""

    text = str(text).strip().lower()

    replacements = {
        "أ": "ا",
        "إ": "ا",
        "آ": "ا",
        "ة": "ه",
        "ى": "ي",
        "ؤ": "و",
        "ئ": "ي",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    text = text.replace("،", ",")
    text = re.sub(r"[^\w\s,/\-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def tokenize(text):
    return [t for t in normalize_text(text).split() if t]

def looks_like_course_code(text):
    if not text:
        return False

    patterns = [
        r"\b[a-zA-Z]{2,6}\s*\d{2,4}\b",
        r"\b\d{6,12}\b"
    ]

    return any(re.search(pattern, text) for pattern in patterns)

# ------------------ LOAD LINKS ------------------

def load_links():
    global cache_links, last_update

    if cache_links and (time.time() - last_update < CACHE_TIME):
        return cache_links

    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv"
    df = pd.read_csv(url)

    links_dict = {}

    if "keywords" not in df.columns or "link" not in df.columns:
        cache_links = {}
        last_update = time.time()
        return cache_links

    for _, row in df.iterrows():
        keywords_value = row.get("keywords")
        link_value = row.get("link")

        if pd.isna(keywords_value) or pd.isna(link_value):
            continue

        link = str(link_value).strip()
        if not link:
            continue

        keywords = str(keywords_value).split(",")

        for keyword in keywords:
            clean_keyword = normalize_text(keyword)
            if clean_keyword:
                links_dict[clean_keyword] = link

    cache_links = links_dict
    last_update = time.time()
    return cache_links

# ------------------ INTENT ------------------

def detect_intent(user_message):
    msg = normalize_text(user_message)

    general_patterns = [
        "اسمك", "من انت", "مين انت", "كيفك",
        "ساعدني", "اشرح", "كيف", "ليش", "لماذا", "شو",
        "what", "who", "how", "why"
    ]

    schedule_patterns = [
        "جدول", "سجل", "اسجل", "اقترح", "مواد الفصل", "خطة"
    ]

    link_patterns = [
        "رابط", "لينك", "المصدر", "البورتال",
        "محاضره", "ماده", "ملف"
    ]

    if looks_like_course_code(user_message):
        return "course_like"

    if any(p in msg for p in schedule_patterns):
        return "general_ai"

    if any(p in msg for p in link_patterns):
        return "course_like"

    if any(p in msg for p in general_patterns):
        return "general_ai"

    if len(msg.split()) <= 3:
        return "course_like"

    return "unknown"

# ------------------ SEARCH ------------------

def find_best_link(user_message, links):
    normalized_message = normalize_text(user_message)
    message_tokens = set(tokenize(normalized_message))

    best_score = 0.0
    best_link = ""

    for keyword, link in links.items():
        keyword_tokens = set(tokenize(keyword))

        seq_score = similarity(normalized_message, keyword)

        contains_score = 0.0
        if keyword in normalized_message or normalized_message in keyword:
            contains_score = 0.97

        overlap_score = 0.0
        if keyword_tokens:
            overlap_score = len(message_tokens & keyword_tokens) / len(keyword_tokens)

        score = max(seq_score, contains_score, overlap_score)

        if score > best_score:
            best_score = score
            best_link = link

    return best_score, best_link

# ------------------ AI (LLAMA) ------------------

def ask_huggingface(user_message):
    if not HF_TOKEN:
        return "❌ API Key غير موجود"

    SYSTEM_PROMPT = """
اسمك مبتكر.
أنت مساعد أكاديمي عربي مخصص لطلاب قسم علم الحاسوب في الجامعة العربية الأمريكية.

مهمتك:
1) مساعدة الطالب في فهم الخطة الدراسية.
2) الإجابة عن الأسئلة المتعلقة بالمواد، ترتيبها، عدد الساعات، والفصل المناسب.
3) اقتراح جدول دراسي بشكل عام بناءً على الخطة فقط.
4) إذا لم تكن معلومات الطالب كافية، اطلب منه توضيح المواد التي أنهاها أو عدد الساعات التي يريد تسجيلها.
5) لا تخترع معلومات غير موجودة في الخطة.
6) لا تذكر مواد ليست في الخطة.
7) لا تعطِ روابط من عندك.
8) إذا سأل الطالب سؤالًا عامًا لا يعتمد على الخطة، أجب باختصار وبأسلوب لطيف.
9) إذا طلب الطالب اقتراح جدول، فاعتمد على تسلسل الخطة الدراسية.
10) إذا ذكر الطالب مواد أنهاها، فخذها بعين الاعتبار.

قواعد الرد:
- أجب بالعربية فقط.
- كن واضحًا ومختصرًا.
- إذا كان السؤال خارج الخطة، قل ذلك بوضوح.
"""

    PLAN_TEXT = """
الخطة الدراسية المعتمدة لقسم علم الحاسوب:

السنة الأولى - الفصل الأول:
- 010610014: لغة انجليزية للمبتدئين (0)
- 040111001: اللغة العربية (2)
- 110411000: مهارات الحاسوب (2)
- متطلب جامعي اختياري (2)
- متطلب جامعي اختياري (2)
- 100411010: تفاضل وتكامل - 1 (3)
- 110111030: مختبر مقدمة في تكنولوجيا المعلومات (1)
- 240221010: مقدمة في تكنولوجيا المعلومات (2)
المجموع: 14

السنة الأولى - الفصل الثاني:
- 010610025: لغة إنجليزية للمتوسطين (2)
- 010610026: لغة إنجليزية للمتوسطين مختبر (1)
- 100411020: تفاضل وتكامل - 2 (3)
- 100413750: رياضيات منفصلة (3)
- 240111011: اساسيات البرمجة (++C) (3)
- 240111021: مختبر اساسيات البرمجة 1 (++C) (1)
- 110411100: تصميم المنطق الرقمي (3)
المجموع: 16

السنة الثانية - الفصل الأول:
- 010610035: لغة انجليزية للمتقدمين (2)
- 010610036: لغة انجليزية للمتقدمين مختبر (1)
- 040521301: أسس أساليب البحث (2)
- 100412040: الرياضيات لتكنولوجيا المعلومات (3)
- 110412120: مختبر اساسيات البرمجة 2 (1)
- 240112003: اساسيات البرمجة 2 (3)
- 240112111: مقدمة في هيكلية الحاسوب (3)
- مساقات حرة (3)
المجموع: 18

السنة الثانية - الفصل الثاني:
- 040511011: الدراسات الفلسطينية (2)
- متطلب جامعي اختياري (2)
- 110113220: مختبر شبكات الحاسوب (1)
- 110412130: مختبر تركيب بيانات (1)
- 240112031: تركيب البيانات (3)
- 240113121: مقدمة في قواعد البيانات (3)
- 240113132: مختبر مقدمة في قواعد البيانات (1)
- 240213480: المحادثة والكتابة التقنية (3)
المجموع: 16

السنة الثالثة - الفصل الأول:
- 240113020: تقنيات البرمجة والخوارزميات (3)
- 240113311: مقدمة في نظم التشغيل (3)
- 240212010: مبادئ برمجة الكيانات (3)
- 240213081: تطوير تطبيقات الانترنت 1 (3)
- مساقات حرة (3)
المجموع: 15

السنة الثالثة - الفصل الثاني:
- متطلب جامعي اختياري (2)
- 240113171: مقدمة في هندسة البرمجيات (3)
- 240113291: برمجة الأجهزة المحمولة (3)
- 240114471: إدارة مشاريع تكنولوجيا المعلومات (3)
- 240213010: برمجة الكيانات المتقدمة (3)
- مساقات حرة (3)
المجموع: 17

السنة الثالثة - الفصل الصيفي:
- 000011110: خدمة مجتمع (0)
- 240113990: تدريب ميداني - علم الحاسوب (3)
المجموع: 3

السنة الرابعة - الفصل الأول:
- 240113620: التحقق واختبار البرمجيات (3)
- 240114331: عمارة الحاسوب (3)
- 240114341: مختبر يونكس (1)
- 240114974: مشروع تخرج 1 (1)
- 240212100: أساسيات رسومات الحاسوب (3)
- 240213231: البرمجة المرئية (3)
- متطلب تخصص اختياري (3)
المجموع: 17

السنة الرابعة - الفصل الثاني:
- 240113221: أمن المعلومات (3)
- 240114081: نظرية الحوسبة (3)
- 240114350: الذكاء الإصطناعي (3)
- 240114982: مشروع التخرج 2 - علم الحاسوب (3)
- متطلب تخصص اختياري (3)
- متطلب تخصص اختياري (3)
المجموع: 18
""".strip()

    try:
        completion = client.chat.completions.create(
            model="meta-llama/Llama-3.1-8B-Instruct:novita",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "system",
                    "content": PLAN_TEXT
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
        )

        return completion.choices[0].message.content

    except Exception as e:
        print("ERROR:", e)
        return "❌ في مشكلة بالاتصال مع الموديل"

# ------------------ ROUTES ------------------

def serve_react_app():
    return send_from_directory(DIST_DIR, "index.html")

@app.route("/")
def home():
    return serve_react_app()

@app.route("/about")
def about():
    return serve_react_app()

@app.route("/assets/<path:filename>")
def react_assets(filename):
    return send_from_directory(os.path.join(DIST_DIR, "assets"), filename)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = str(data.get("message", "")).strip()

    if not user_message:
        return jsonify({"reply": "الرجاء كتابة رسالة أولًا."})

    try:
        links = load_links()
    except Exception:
        links = {}

    intent = detect_intent(user_message)
    best_score, best_link = find_best_link(user_message, links)

    if intent == "general_ai":
        return jsonify({"reply": ask_huggingface(user_message)})

    if intent == "course_like":
        if best_score >= 0.60:
            return jsonify({"reply": best_link})
        return jsonify({"reply": ask_huggingface(user_message)})

    if best_score >= 0.72:
        return jsonify({"reply": best_link})

    return jsonify({"reply": ask_huggingface(user_message)})

@app.route("/<path:path>")
def react_fallback(path):
    if path.startswith(("chat", "assets")):
        return jsonify({"error": "Not found"}), 404
    return serve_react_app()

# ------------------ RUN ------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
