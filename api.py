from flask import jsonify
from flask_restful import Resource, reqparse, fields, marshal_with
from error import NotFoundError, UserManagementError, SectionManagementError, BookManagementError, RequestManagementError
from models import  db, User, Role, Section, Book, Request, Feedback
from sec import store
from datetime import datetime, timedelta
# from flask_security import hash_password
from flask_security.decorators import auth_required
from flask_login import login_required

register_fields = {
   'username': fields.String,
   'email': fields.String,
   'password': fields.String,
   'roles': fields.String
}

register_user_parser=reqparse.RequestParser()
register_user_parser.add_argument('username')
register_user_parser.add_argument('email')
register_user_parser.add_argument('password')
register_user_parser.add_argument('roles')





class registerAPI(Resource):
   @marshal_with(register_fields)
   def post(self):
      args = register_user_parser.parse_args()
      username=args.get("username", None)
      email=args.get("email", None)
      password=args.get("password", None)
      roles=args.get("roles", None)
    
      if username is None:
         raise UserManagementError(status_code=400, error_code="UM1001", error_message="username is required")
      if email is None:
         raise UserManagementError(status_code=400, error_code="UM1002", error_message="email is required")
      if password is None:
         raise UserManagementError(status_code=400, error_code="UM1003", error_message="password is required")
      if roles is None:
         raise UserManagementError(status_code=400, error_code="UM1004", error_message="roles is required")
      
      role_names = roles.split(',')

      roles = []
      for role_name in role_names:
            role = store.find_role(role_name.strip())
            if not role:
                role = store.create_role(name=role_name.strip())
            roles.append(role)
         
    
      if not store.find_user(email=email):
         store.create_user(email=email, password=password, username=username, roles=roles)
      db.session.commit()
      return 201
    
section_fields = {
   'user_id': fields.Integer,
   'sec_id': fields.Integer,
   'sec_name': fields.String,
   'description': fields.String
}

create_section_parser=reqparse.RequestParser()
create_section_parser.add_argument('sec_name')
create_section_parser.add_argument('description')


update_section_parser=reqparse.RequestParser()
update_section_parser.add_argument('sec_name')
update_section_parser.add_argument('description')


class SectionManagerAPI(Resource):
   @marshal_with(section_fields)
   @login_required
   def get(self, user_id):
      section = Section.query.filter_by(user_id=user_id).all()
      print(section)
      if section:
         return section
      return NotFoundError(status_code=404)

   @marshal_with(section_fields)
   @login_required
   def post(self, user_id):
      args = create_section_parser.parse_args()
      sec_name=args.get("sec_name", None)
      description=args.get("description", None)
      
    
      if sec_name is None:
         raise SectionManagementError(status_code=400, error_code="HM1001", error_message="sec_name is required")
      if description is None:
         raise SectionManagementError(status_code=400, error_code="HM1002", error_message="description is required")
    
      new_section=Section(user_id=user_id, sec_name=sec_name, description=description)
      db.session.add(new_section)
      db.session.commit()
      return new_section, 201

   @marshal_with(section_fields)
   @login_required
   def put(self, user_id, sec_id):
      args=update_section_parser.parse_args()
      sec_name=args.get("sec_name", None)
      description=args.get("description", None)
      section = Section.query.get(sec_id)
    
      if sec_name is None:
         raise SectionManagementError(status_code=400, error_code="HM1001", error_message="sec_name is required")
      if description is None:
         raise SectionManagementError(status_code=400, error_code="HM1002", error_message="description is required")

      section = Section.query.filter_by(user_id=user_id, sec_id=sec_id).first()
      if section:
         section.sec_name=sec_name
         section.description=description  
         db.session.add(section)
         db.session.commit()
         return section 
      else:
         raise NotFoundError(status_code=404)

   @login_required
   def delete(self, user_id, sec_id):
      section = Section.query.filter_by(user_id=user_id, sec_id=sec_id).first()
      if section:
         db.session.delete(section)
         db.session.commit()  
         return "", 200
      else:
         raise  NotFoundError(status_code=404)

book_fields = {
    "user_id": fields.Integer,
    "sec_id": fields.Integer,
    "book_id": fields.Integer,
    "title": fields.String,  
    "author": fields.String, 
    "description": fields.String,  
    "price": fields.Float, 
}

update_book_parser = reqparse.RequestParser()
update_book_parser.add_argument('title')
update_book_parser.add_argument('author')
update_book_parser.add_argument('description')
update_book_parser.add_argument('price', type=float)

create_book_parser = reqparse.RequestParser()
create_book_parser.add_argument('title')
create_book_parser.add_argument('author')
create_book_parser.add_argument('description')
create_book_parser.add_argument('price', type=float)

class BookManagerAPI(Resource):
    @marshal_with(book_fields)
    @login_required
    def get(self, user_id, sec_id):
        books = Book.query.filter_by(user_id=user_id, sec_id=sec_id).all()
        if books:
            return books
        else:
            raise NotFoundError(status_code=404)

    @marshal_with(book_fields)
    @login_required
    def put(self, user_id, sec_id, book_id):
        args = update_book_parser.parse_args()
        title = args.get('title')
        author = args.get('author')
        description = args.get('description')
        price = args.get('price')

        if not title:
            raise BookManagementError(status_code=400, error_code="SM1001", error_message="Title is required")
        if not author:
            raise BookManagementError(status_code=400, error_code="SM1002", error_message="Author is required")
        if not description:
            raise BookManagementError(status_code=400, error_code="SM1003", error_message="Description is required")
        if price is None:
            raise BookManagementError(status_code=400, error_code="SM1004", error_message="Price is required")

        
        book = Book.query.filter_by(user_id=user_id, sec_id=sec_id, book_id=book_id).first()
        if book:
            book.title = title
            book.author = author
            book.description = description
            book.price = price

            db.session.add(book)
            db.session.commit()
            return book
        else:
            raise NotFoundError(status_code=404)

    @login_required
    def delete(self, user_id, sec_id, book_id):
        book = Book.query.filter_by(user_id=user_id, sec_id=sec_id, book_id=book_id).first()
        if book:
            db.session.delete(book)
            db.session.commit()
            return "", 200
        else:
            raise NotFoundError(status_code=404)

    @login_required 
    def post(self, user_id, sec_id):
        args = create_book_parser.parse_args()
        title = args.get('title', None)
        author = args.get('author', None)
        description = args.get('description', None)
        price = args.get('price', None)

        if title is None:
            raise BookManagementError(status_code=400, error_code="SM1001", error_message="Title is required")
        if author is None:
            raise BookManagementError(status_code=400, error_code="SM1002", error_message="Author is required")
        if description is None:
            raise BookManagementError(status_code=400, error_code="SM1003", error_message="Description is required")
        if price is None:
            raise BookManagementError(status_code=400, error_code="SM1004", error_message="Price is required")

        section = Section.query.filter_by(user_id=user_id, sec_id=sec_id).first()
        if section:
            new_book = Book(user_id=user_id, sec_id=sec_id, title=title, author=author, description=description, price=price)
            db.session.add(new_book)
            db.session.commit()
            return "new_book", 201
        else:
            raise NotFoundError(status_code=404)

      
class getSectionAPI(Resource):
   @marshal_with(section_fields)
   def get(self):
      section = Section.query.all()
      return section 

class getBookAPI(Resource):
   @marshal_with(book_fields)  
   def get(self, sec_id):
      book = Book.query.filter_by(sec_id=sec_id).all()
      return book
   
issue_fields = {
    "req_id": fields.Integer,
    "user_id": fields.Integer,
    "book_id": fields.Integer,
    "title": fields.String,
    "request_date": fields.DateTime,
    "expiry_date": fields.DateTime,
}

create_issue_parser = reqparse.RequestParser()
create_issue_parser.add_argument('n_book')

update_issue_parser = reqparse.RequestParser()
update_issue_parser.add_argument('n_book')
class IssueManagerAPI(Resource):
    @marshal_with(issue_fields)
    @login_required
    def get(self, user_id):
        requests = Request.query.filter_by(user_id=user_id).all()
        if requests:
            return requests
        else:
            return NotFoundError(status_code=404)

    @marshal_with(issue_fields)
    @login_required
    def put(self, user_id, book_id, title, req_id):
        args = update_issue_parser.parse_args()
        book_count = args.get("n_book", None)

        if book_count is None:
             raise RequestManagementError(status_code=400, error_code="BM1001", error_message="n_book is required")

        request = Request.query.filter_by(req_id=req_id, user_id=user_id, book_id=book_id, title=title).first()
        book_count = Request.query.filter_by(user_id=user_id).count()
        if book_count >= 5:
              return jsonify({'error': 'You have reached the limit of 5 books.'}), 400
        else:
             db.session.add(request)
             db.session.commit()
             return request

    @login_required
    def delete(self, user_id, book_id,title, req_id):
        # Find request to delete
        request_to_delete = Request.query.filter_by(user_id=user_id, book_id=book_id,title=title, req_id=req_id).first()

        if request_to_delete:
            db.session.delete(request_to_delete)
            db.session.commit()
            return "", 200
        else:
            return jsonify({"error": "Request not found"}), 404

    @marshal_with(issue_fields)
    @login_required
    def post(self, user_id, book_id, title):
        args = create_issue_parser.parse_args()
        book = Book.query.filter_by(book_id=book_id).first()

        if not book:
            return jsonify({"error": "Book not found"}), 404

        request_date = datetime.now()
        expiry_date = request_date + timedelta(days=7)
        new_request = Request(
            user_id=user_id,
            book_id=book_id,
            title= title,
            request_date=request_date,
            expiry_date=expiry_date,
        )

        db.session.add(new_request)
        db.session.commit()
        return new_request, 201
