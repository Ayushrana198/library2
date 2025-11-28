# Library Management App

A full-stack library management application built with Flask, Vue.js, and SQLite. Librarians (admins) manage book sections and assignments, while users request, borrow, return books, provide feedback, and read issued books.

## Features

- **Authentication**: Secure login for users and librarians using Flask-Security
- **Admin Functions**: Create book genres/sections, assign books to sections
- **User Functions**: Book requests, returns, feedback, read issued books
- **Background Tasks**: Celery + Redis for reports, email alerts, exports
- **Frontend**: Vue.js SPA with Axios for API calls, Bootstrap styling
- **Database**: SQLite with SQLAlchemy ORM

## Tech Stack

- Backend: Flask, Flask-Security, SQLAlchemy, Celery, Redis
- Frontend: Vue.js, Bootstrap, Axios, HTML/CSS/JavaScript
- Database: SQLite

## Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ayushrana198/library2.git
   cd library2
   ```

2. **Create & activate virtual environment**
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python main.py
   ```
   Open `http://localhost:5000` in your browser.[1]

## Database Schema

- **User**: userid, username, email, password, roles
- **Role**: roleid, name
- **Section**: secid, secname, description, books
- **Book**: bookid, title, author, secid, price
- **Request**: reqid, bookid, userid, request/expiry dates
- **Feedback**: feedid, userid, bookid, feedback

**Author**: Ayush Singh Rana (21F1005671)[1]

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/50109167/8ab52b8e-a6c6-4350-96cc-8d9a9a2d27f0/project_report.pdf)
