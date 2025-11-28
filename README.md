# library2
Library Management App

Description
The project is created based on a library management app. The app using proper login handles
with flask security creates a new librarian and user. A librarian is an admin who can create
sections(book genre) and assign books to it. A user can request for the book and return the
book and can give feedback on the book . Users can also read the issued book.

Functionalities used in the app:

➔ Flask framework is used to handle the logic of the backend and to handle Restful_API
endpoints to successfully run CRUD operations.

➔ SQLite is used to create the database and manage all the cores of the application.

➔ Bootstrap is used to style and render the page beautifully.

➔ Vue.js framework is used to handle the frontend part of the code and form the view logic
of the app.

➔ Celery and Redis are used to do the backend hidden jobs for the application such as
exporting the details, alerting users,by sending mails and generating reports.

➔ Flask Security is used to authenticate and authorize particular tasks to the user and
admin.

➔ Axios is used to get the http requests to handle the error and to build an SPA.

➔ SQL-Alchemy to create the relational mapping and interact with the database.

➔ Javascript , Python, html/css.
