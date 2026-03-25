from flask import Flask, request, jsonify, render_template, url_for
import pandas as pd
import time
from difflib import SequenceMatcher
import os

# تعريف التطبيق وتحديد مسارات المجلدات بدقة
app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# معرف ملف Google Sheets الخاص بك
Sheet_ID = "1eX0HjdZKYD9TvvavRWzL1uQ0sCFv_u_X-38vNholUeA"

# إعدادات التخزين المؤقت (Cache)
cache_links = {}
last_update = 0
CACHE_TIME = 28800  # 8 ساعات

def similarity(a, b):
    """حساب نسبة التشابه بين نصين"""
    return SequenceMatcher(None, a, b).ratio()

def load_links():
    """تحميل البيانات من Google Sheets مع دعم التخزين المؤقت"""
    global cache_links, last_update

    # التحقق إذا كانت البيانات المخزنة لا تزال صالحة
    if cache_links and (time.time() - last_update < CACHE_TIME):
        return cache_links

    try:
        # رابط تصدير ملف الـ CSV من Google Sheets
        url = f"https://docs.google.com/spreadsheets/d/{Sheet_ID}/export?format=csv"
        df = pd.read_csv(url)

        links_dict = {}
        for _, row in df.iterrows():
            # التأكد من وجود قيم في الأعمدة المطلوبة
            if pd.isna(row.get("keywords")) or pd.isna(row.get("link")):
                continue

            keywords = str(row["keywords"]).lower().split(",")
            for keyword in keywords:
                links_dict[keyword.strip()] = row["link"]

        cache_links = links_dict
        last_update = time.time()
        print("✅ تم تحديث قواعد بيانات الروابط بنجاح.")
        return cache_links

    except Exception as e:
        print(f"❌ خطأ أثناء تحميل البيانات: {e}")
        return cache_links if cache_links else {}

@app.route('/')
def home():
    """عرض الصفحة الرئيسية"""
    return render_template("index.html")

@app.route('/about')
def about():
    """عرض صفحة من نحن"""
    return render_template("about.html")

@app.route("/chat", methods=["POST"])
def chat():
    """نقطة نهاية الشات بوت"""
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"reply": "عذراً، حدث خطأ في إرسال الرسالة."}), 400

        user_message = data["message"].lower().strip()
        links = load_links()

        best_score = 0
        best_link = ""

        # البحث عن أفضل تطابق بين رسالة المستخدم والكلمات المفتاحية
        for keyword, link in links.items():
            score = similarity(user_message, keyword)
            if score > best_score:
                best_score = score
                best_link = link

        # تحديد عتبة القبول (Threshold) للرد
        if best_score > 0.4:
            return jsonify({"reply": best_link})

        return jsonify({"reply": "لم أجد رابطاً مناسباً لهذا السؤال. جرب كلمات مفتاحية أخرى مثل 'كاللكس' أو 'ميكانيكا'."})

    except Exception as e:
        print(f"❌ خطأ في معالجة الشات: {e}")
        return jsonify({"reply": "حدث خطأ فني، يرجى المحاولة لاحقاً."})

if __name__ == "__main__":
    # تشغيل السيرفر في وضع التطوير
    app.run()