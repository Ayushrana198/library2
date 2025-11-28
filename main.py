from flask import Flask, jsonify, render_template, session, redirect, request,abort
from flask_security import Security, current_user
from flask_login import login_required, logout_user
import config
from models import db
from sec import store
from flask_restful import Api
import worker
import csv
from io import StringIO
from flask.wrappers import Response
from functools import wraps
import pytz
from flask_cors import CORS

def initiate_app():
    global app, api, celery
    app = Flask(__name__)
    app.config.from_object(config)
    db.init_app(app)
    app.app_context().push()
    
    api = Api(app)
    app.app_context().push()

    celery = worker.celery
    celery.conf.update(
        broker_url=app.config['CELERY_BROKER_URL'],
        result_backend=app.config['CELERY_RESULT_BACKEND'],
        timezone=app.config['CELERY_TIMEZONE']
    )
    celery.Task = worker.ContextTask
    app.app_context().push()
    return app, api, celery


app, api, celery=initiate_app()
CORS(app)
security = Security(app, store)

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/user', methods=['GET'])
def get_user_info():
    if not current_user.is_authenticated:
        return jsonify(message="User not authenticated"), 401
    roles = [role.name for role in current_user.roles]

    return jsonify(response={
        'user_id': current_user.user_id,
        'username': current_user.username,
        'email': current_user.email,
        'roles': roles
    }), 200



@app.route("/export_sections", methods=["GET"])
@login_required
def export_sections():
    ufs = session["_user_id"]
    user=User.query.filter_by(fs_uniquifier=ufs).first()
    sections=Section.query.filter_by(user_id=user.user_id).all()
    csv_text = StringIO()
    csv_file = csv.writer(csv_text, dialect="excel")
    csv_file.writerow(["sec_id", "sec_name", "description",  "book_id", "title", "author", "description", "price"])
    for s in sections:
        book=Book.query.filter_by(sec_id=s.sec_id).all()
        for b in book:
            csv_file.writerow([s.sec_id, s.sec_name, s.description,  b.book_id, b.title, b.author, b.description, b.price])
    return Response(csv_text.getvalue(), mimetype="text/csv", headers={"Content-disposition": "attachment; filename=sections.csv"})


@app.route("/logout")
def logout():
    logout_user()
    return redirect('/') 

@app.route('/api/feedback/<int:user_id>/<int:book_id>/<string:title>', methods=['POST'])
def submit_feedback(user_id, book_id, title):
    data = request.json
    feedback = data.get('feedback')
    
    feedback_entry = Feedback(book_id=book_id, user_id=user_id, title=title, feedback=feedback)
    db.session.add(feedback_entry)
    db.session.commit()
    
    return jsonify({'message': 'Feedback submitted successfully.'})

@app.route('/api/book/<int:book_id>/description', methods=['GET'])
def get_book_description(book_id):
    book = Book.query.filter_by(book_id=book_id).first()
    
    if book is None:
        abort(404, description=f"Book with ID {book_id} not found")
    
    response = {
        'title' : book.title,
        'description': book.description
    }
    return jsonify(response)

@app.route('/api/userbooks', methods=['GET'])
def get_user_books():
    user_books = db.session.query(Request).all()
    
    book_data = []
    
    for userbook in user_books:
        
        user = db.session.query(User).get(userbook.user_id)
        
        book_info = {
            "req_id": userbook.req_id,
            "title": userbook.book.title,
            "expiry_date": userbook.expiry_date.strftime('%Y-%m-%d'),
            "username": user.username if user else "Unknown"
        }
        book_data.append(book_info)
    
    return jsonify(book_data)

@app.route('/api/revoke-book/<int:req_id>', methods=['DELETE'])
def revoke_book(req_id):
    request_to_delete = Request.query.get(req_id)
    
    if request_to_delete:
        db.session.delete(request_to_delete)
        db.session.commit()
        return '', 204  
    else:
        return jsonify({"error": "Request not found"}), 404
    
@app.route('/api/search/books', methods=['GET'])
def search_books():
    term = request.args.get('term')
    books = Book.query.filter(Book.title.ilike(f'%{term}%')).all()
    
    book_list = [{'book_id': book.book_id,
                  'title': book.title,
                  'author': book.author,
                  'price': book.price}
                 for book in books]
    
    return jsonify(book_list)



from api import *
api.add_resource(registerAPI, '/api/register')
api.add_resource(SectionManagerAPI, '/api/sections/<int:user_id>', '/api/sections/<int:user_id>/<int:sec_id>')
api.add_resource(BookManagerAPI, '/api/book/<int:user_id>/<int:sec_id>', '/api/book/<int:user_id>/<int:sec_id>/<int:book_id>')
api.add_resource(getSectionAPI, '/api/sections') 
api.add_resource(getBookAPI, '/api/book/<int:sec_id>') 
api.add_resource(IssueManagerAPI, "/api/request-book/<int:user_id>", "/api/request-book/<int:user_id>/<int:book_id>/<string:title>", "/api/request-book/<int:user_id>/<int:book_id>/<string:title>/<int:req_id>")

with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=True)
    