from flask_security import UserMixin, RoleMixin
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

db=SQLAlchemy()

roles_users=db.Table('roles_users', 
                     db.Column('user_id', db.Integer(), db.ForeignKey('user.user_id')),
                     db.Column('role_id', db.Integer(), db.ForeignKey('role.role_id')))

class User(db.Model,UserMixin):
    __tablename__ = "user"
    user_id = db.Column(db.Integer, primary_key = True, autoincrement = True, unique = True, nullable = False)
    username = db.Column(db.String, unique = True, nullable = False)
    email = db.Column(db.String, nullable = False)
    password = db.Column(db.String, nullable = False)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    
class Role(db.Model, RoleMixin):
    __tablename__ = "role"
    role_id=db.Column(db.Integer(), primary_key=True)
    name=db.Column(db.String(80), unique=True)
      
class Section(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable = False)
    sec_id = db.Column(db.Integer, primary_key=True)
    sec_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300), nullable=False)
    books = db.relationship('Book', backref='section', cascade="all, delete")
       
class Book(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    sec_id = db.Column(db.Integer, db.ForeignKey('section.sec_id'), nullable=False)
    book_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300000), nullable=False)
    price = db.Column(db.Float, nullable=False)
    request = db.relationship(
        'Request',
        backref='book',
        cascade="all, delete",
        foreign_keys='Request.book_id'  
    )
   
class Request(db.Model):
    req_id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.book_id'), nullable=False)
    title = db.Column(db.String(100), db.ForeignKey('book.title'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    request_date = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now())
    expiry_date = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now() + timedelta(days=7))

class Feedback(db.Model):
    feed_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.book_id'), nullable=False)
    title = db.Column(db.String(100), db.ForeignKey('book.title'), nullable=False)
    feedback = db.Column(db.String(500), nullable=False)