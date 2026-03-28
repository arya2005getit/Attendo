from flask import Flask, request
from flask_cors import CORS
import os

from attendance_alerts import send_attendance_emails

app = Flask(__name__)
CORS(app)

SAVE_PATH = os.path.join(os.path.dirname(__file__), "attendance2.xlsx")


@app.post("/upload-excel")
def upload_excel():
    file = request.files.get("file")
    if not file:
        return {"error": "no file"}, 400

    with open(SAVE_PATH, "wb") as handle:
        handle.write(file.read())

    return {"status": "received", "path": SAVE_PATH}


@app.post("/send-attendance-emails")
def send_attendance_emails_route():
    payload = request.get_json(silent=True) or {}
    stats = payload.get("stats") or []

    if not stats:
        return {"error": "no attendance stats provided"}, 400

    try:
        print(f"Received email request, students={len(stats)}, mode={payload.get('mode')}")
        result = send_attendance_emails(payload)
        print(f"Email result: {result}")
        return result
    except Exception as exc:
        print("Email error:", exc)
        return {"error": str(exc)}, 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
