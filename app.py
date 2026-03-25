from flask import Flask, request, jsonify, render_template
import pandas as pd
import time
from difflib import SequenceMatcher

app = Flask(_name_,
            static_folder='static',
            template_folder='templates')

Sheet_ID = "1eX0HjdZKYD9TvvavRWzL1uQ0sCFv_u_X-38vNholUeA"

cache_links = {}
last_update = 0
CACHE_TIME = 28800  # 8 ساعات

def similarity(a, b):
    return SequenceMatcher(None, a, b).ratio()

def load_links():
    global cache_links, last_update

    if cache_links and (time.time() - last_update < CACHE_TIME):
        return cache_links

    try:
        url = f"https://docs.google.com/spreadsheets/d/{Sheet_ID}/export?format=csv"
        df = pd.read_csv(url)

        links_dict = {}

        for _, row in df.iterrows():
            if pd.isna(row.get("keywords")) or pd.isna(row.get("link")):
                continue

            keywords = str(row["keywords"]).lower().split(",")

            for keyword in keywords:
                links_dict[keyword.strip()] = row["link"]

        if links_dict:
            cache_links = links_dict
            last_update = time.time()
            print("✅ Cache updated")

        return cache_links

    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return cache_links if cache_links else {}

# 🔥 endpoint خفيف لـ UptimeRobot
@app.route('/ping')
def ping():
    return "OK", 200

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/about')
def about():
    return render_template("about.html")

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        if not data or "message" not in data:
            return jsonify({"reply": "عذراً، حدث خطأ في إرسال الرسالة."}), 400

        user_message = data["message"].lower().strip()
        links = load_links()

        best_score = 0
        best_link = ""

        for keyword, link in links.items():
            score = similarity(user_message, keyword)
            if score > best_score:
                best_score = score
                best_link = link

        if best_score > 0.4:
            return jsonify({"reply": best_link})

        return jsonify({
            "reply": "لم أجد رابطاً مناسباً. جرب كلمات اخرى ."
        })

    except Exception as e:
        print(f"❌ Chat error: {e}")
        return jsonify({"reply": "حدث خطأ فني، حاول لاحقاً."})

if _name_ == "_main_":
    print("🚀 Starting server...")
    load_links()  # 🔥 تحميل البيانات أول تشغيل
    app.run()