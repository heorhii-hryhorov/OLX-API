require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const productRoutes = require("./routes/productRoutes");
const userRoutes = require('./routes/userRoutes');


// Create connection
const db = mysql.createConnection({
    host        : process.env.HOST,
    user        : process.env.USER,
    password    : process.env.PASSWORD,
    database    : process.env.DB
});

// Connect and create a table
db.connect(err => {
    if (err) {
        throw err;
    }
    console.log("Connected!");
    let sql = "CREATE TABLE IF NOT EXISTS users (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, phone VARCHAR(15), name VARCHAR(20), email VARCHAR(255), password VARCHAR(255))";
    db.query(sql, (err, result) => {
        if(err) throw err;        
    });

    sql = "CREATE TABLE IF NOT EXISTS products (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, title VARCHAR(20), price VARCHAR(20), image VARCHAR(2000), user_id INT(11))";
    db.query(sql, (err, result) => {
        if(err) throw err;        
    });

    db.query("SET SESSION wait_timeout = 604800");
  });
global.db = db;

const app = express();
// Set folder with static files
app.use('./uploads', express.static('uploads'));

// Set middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes that handle request to user and products
app.use("/api", userRoutes);
app.use("/api", productRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});