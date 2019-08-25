# Node/Express/Mysql API

# Getting started

To get the Node server running locally:

- Clone this repository
- `npm install` to install all required dependencies
-  make sure `uploads` folder exists
-  create .env file and add environmental variables to it
- `node app.js` to start the local server

## Dependencies

- [expressjs](https://github.com/expressjs/express) - The server for handling and routing HTTP requests
- [mysql](https://github.com/mysqljs/mysql) - A pure node.js JavaScript Client implementing the MySQL protocol
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - JsonWebToken implementation for node.js
- [multer](https://github.com/expressjs/multer) - Node.js middleware for handling `multipart/form-data`.
- [body-parser](https://github.com/expressjs/body-parser) - Node.js body parsing middleware

## Application Structure

- `app.js` - The entry point to the application. This file defines our express server. It also requires the routes and models we'll be using in the application.
- `controllers/` - This folder contains a file that checks if user is logged in.
- `uploads/` - This folder contains images uploaded to the server.
