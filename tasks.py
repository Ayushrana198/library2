from main import celery 
from models import User, Request
from celery.schedules import crontab
from communication import send_email
import time 
from flask import render_template

@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(crontab(hour=20, minute=55),daily_reminder.s())
    sender.add_periodic_task(crontab(hour=12, minute=45, day_of_month='1'),monthly_issue_report.s()) 

@celery.task()
def daily_reminder():
         users=User.query.all()  
         for u in users:
             request=Request.query.filter_by(user_id=u.user_id).first()
             if not request:
                 send_email('21f1005671@ds.study.iitm.ac.in',u.email,u.username,'This is reminder to visit library management. Do not forget to check new books added today')
                 print("Sending reminder to:", u.username)
        
@celery.task()
def monthly_issue_report():
    users=User.query.all()
    for u in users:
        request=Request.query.filter_by(user_id=u.user_id).all()
        report=render_template('monthly_issue_report.html', user=u, request=request)
        send_email('21f1005671@ds.study.iitm.ac.in',u.email,u.username,'Check out your monthly issued books report', report)
        print('sending report to ', u.email)
