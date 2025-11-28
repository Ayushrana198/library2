import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.base import MIMEBase
from email.encoders import encode_base64



sender='sihrnayush198@gmail.com'
recipient='21f1005671@ds.study.iitm.ac.in'
subject='test email with attachment'
message='This is a test email sent from python with an attachment.'

def send_email(sender, receiver,subject,message,attachment=None):

    msg=MIMEMultipart()
    msg['From']=sender
    msg['To'] = recipient
    msg['subject']=subject
    msg.attach(MIMEText(message, "html"))

    if attachment:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(attachment)
        encode_base64(part)
        part.add_header(
                "Content-Disposition", f"attachment; filename={attachment}",
        )
        msg.attach(part)


    smtp_server='smtp.gmail.com'
    smtp_port=587
    smtp_username=sender 
    smtp_password=''

    with smtplib.SMTP(smtp_server,smtp_port) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(sender,receiver,msg.as_string())




