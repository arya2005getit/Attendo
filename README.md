# 📊 Student Attendance Management System (SMTP Version)

## 🚀 Overview

This project is a Student Attendance Management System that allows tracking of attendance and sending email notifications using Gmail SMTP.

---

## ✨ Features

* 📋 Mark attendance
* 📊 View attendance reports
* ⚠️ Email alerts for low attendance
* 📧 Email sending via Gmail SMTP

---

## 🛠️ Tech Stack

* Frontend: HTML, CSS, JavaScript
* Backend: Python (Flask)
* Email Service: Gmail SMTP

---

## 📧 Email System

* Sends emails to students and parents
* Uses Gmail SMTP server
* Requires App Password for authentication

---

## 🔐 Environment Setup

Create `.env` file:

```
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

---

## ▶️ How to Run

1. Clone the repository:

```
git clone https://github.com/your-username/attendance-system.git
```

2. Install dependencies:

```
pip install -r requirements.txt
```

3. Run the app:

```
python receiver.py
```

4. Open:

```
http://localhost:5000
```

---

## ⚠️ Limitations

* Limited email sending capacity
* Slower performance for bulk emails
* May face SMTP connection issues

---

## 🧠 Future Improvements

* Replace SMTP with SendGrid API for scalability
* Add database integration
* Improve UI/UX

---

## 👨‍💻 Author

Arya Dilliwale
