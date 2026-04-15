from flask import Flask, request, jsonify, render_template
import pandas as pd
import time
import os
import re
from difflib import SequenceMatcher
from dotenv import load_dotenv
from openai import OpenAI  # ⭐️ الجديد

load_dotenv()

app = Flask(__name__)

SHEET_ID = "1eX0HjdZKYD9TvvavRWzL1uQ0sCFv_u_X-38vNholUeA"
CACHE_TIME = 60 * 60 * 8  # 8 hours

cache_links = {}
last_update = 0

HF_TOKEN = os.environ.get("HF_TOKEN", "").strip()  # ⭐️ بدل HF_API_KEY

# ⭐️ إعداد الكلاينت الجديد
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

    try:
        completion = client.chat.completions.create(
            model="meta-llama/Llama-3.1-8B-Instruct:novita",
            messages=[
                {
                    "role": "system",
                    "content": "أنت مساعد أكاديمي لطلاب علم الحاسوب. أجب بالعربية بشكل واضح ومختصر."
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

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

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

# ------------------ RUN ------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)