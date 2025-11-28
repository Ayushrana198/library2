from celery import Celery
from flask import current_app

celery = Celery('Application Jobs')

class ContextTask(celery.Task):
    def __call__(self, *args, **kwargs):
        with current_app.app_context():
            return self.run(*args, **kwargs)

celery.Task = ContextTask
