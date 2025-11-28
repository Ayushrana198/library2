from flask_security import SQLAlchemyUserDatastore
from models import User, db, Role



store = SQLAlchemyUserDatastore(db, User, Role)
