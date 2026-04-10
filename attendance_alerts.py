import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, List, Tuple

GMAIL_USER = os.getenv("GMAIL_USER", "automated.attendance.alerts@gmail.com")
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD", "nwpqwxeqhtfqxsnv")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))


def build_recipients(mode: str, stats: List[Dict]) -> List[Tuple[str, Dict]]:
    recipients: List[Tuple[str, Dict]] = []

    for student in stats:
        below_75 = student.get("percentage", 0) < 75
        student_email = (student.get("email") or "").strip()
        parent_email = (student.get("parentEmail") or "").strip()

        if mode == "students_all" and student_email:
            recipients.append((student_email, student))
        elif mode == "students_and_parents_all":
            if student_email:
                recipients.append((student_email, student))
            if parent_email:
                recipients.append((parent_email, student))
        elif mode == "below_75_students":
            if below_75 and student_email:
                recipients.append((student_email, student))
        elif mode == "below_75_students_and_parents":
            if below_75 and student_email:
                recipients.append((student_email, student))
            if below_75 and parent_email:
                recipients.append((parent_email, student))

    return recipients


def send_attendance_emails(payload: Dict) -> Dict:
    mode = payload.get("mode", "students_all")
    stats = payload.get("stats", [])
    course_name = payload.get("courseName", "Course")
    course_code = payload.get("courseCode", "")

    recipients = build_recipients(mode, stats)
    unique_recipients = []
    seen = set()

    for email, student in recipients:
        key = (email, student.get("studentId"))
        if key in seen:
            continue
        seen.add(key)
        unique_recipients.append((email, student))

    if not unique_recipients:
        raise ValueError("No valid email recipients found for the selected option.")

    sent = 0

    try:
        print(f"Attempting SMTP login for {GMAIL_USER}; recipients {len(unique_recipients)}")
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_PASSWORD)

            for email, student in unique_recipients:
                message = MIMEMultipart()
                message["From"] = GMAIL_USER
                message["To"] = email
                message["Subject"] = f"Attendance Update - {course_name} ({course_code})".strip()

                body = (
                    f"Attendance update for {student.get('fullName', 'Student')}\n\n"
                    f"Course: {course_name} ({course_code})\n"
                    f"Attended Lectures: {student.get('attended', 0)} / {student.get('totalLectures', 0)}\n"
                    f"Overall Attendance: {student.get('percentage', 0)}%\n\n"
                    "This is an automated attendance summary."
                )

                message.attach(MIMEText(body, "plain"))
                server.sendmail(GMAIL_USER, email, message.as_string())
                sent += 1
                print(f"Sent to {email}")
    except smtplib.SMTPAuthenticationError as exc:
        print("SMTP auth failed:", exc)
        raise RuntimeError("Gmail login failed. Check the sender email and app password.") from exc
    except OSError as exc:
        print("SMTP connection error:", exc)
        raise RuntimeError("Could not connect to Gmail SMTP. Check internet access on the machine running receiver.py.") from exc

    return {
        "sent": sent,
        "skipped": max(0, len(unique_recipients) - sent)
    }
