# Documentation
Here is the main documentation page for Discbro.

## Discbro
Discbro is a messaging app similar to Discord, which allows users to create an account, add friends, chat directly with friends, create message groups...

It works using SQLite3 as the database, Express.js as the server, bcrypt as the hasher, and WebSockets (ws) to almost instantaniously send messages between users.
The packages will be checked for vulnerabilities.



## Security
The app currently runs on HTTP. This will change as I create a certificate and key, which will be used to convert it to HTTPS. This makes the app significantly more secure, as passwords will no longer be transmitted over the web in plain-text.