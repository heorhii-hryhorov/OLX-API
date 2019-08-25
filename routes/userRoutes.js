const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuth = require('../middleware/check-auth');

router.post('/register', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    // check if password is valid
    if (req.body.name && req.body.email && req.body.password) {
        if(!req.body.password.match('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})')) {
            return res.status(422).send([{field:"current_password", message:"Wrong current password"},]);
        } else {       
            bcrypt.hash(req.body.password, 10, (err, hash) => {     
                let user = {
                    phone       :   req.body.phone,
                    name        :   req.body.name,
                    email       :   req.body.email,
                    password    :   hash
                };
                
                let sql = "INSERT INTO users SET ?";
                db.query(sql, user, (err, result) => {
                    if(err){
                    throw err;
                    } else {
                        let sql = "SELECT * FROM users WHERE email = ?";
                        db.query(sql, req.body.email, (err, result1) => {
                            if(err){
                            throw err;
                            } else {
                                const token = jwt.sign(
                                    {
                                      id: result1[0].id,  
                                      email: req.body.email,
                                    },
                                    process.env.JWT_KEY,
                                    {
                                      expiresIn: "1h"
                                    }
                                  );
                                res.send({token: token});
                            }
                        });
                    }
                });
            });
        }
    }
});


router.get('/login', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    if (req.body.email && req.body.password) {    
        let user = [req.body.email];
        let sql = "SELECT * FROM users WHERE email = ?";
        db.query(sql, user, (err, result) => {
            if(err){
               throw err;
            } else if(result.length < 1) {
                return res.status(422).send([{field:"email", message:"Wrong email"}]);
            } else {
                // compare passwords from resuest and db
                bcrypt.compare(req.body.password, result[0].password, (err, result1) => {
                    if (err) throw err;
                    if (result1) {
                        let sql = "SELECT * FROM users WHERE email = ?";
                        db.query(sql, req.body.email, (err, result2) => {
                            if(err){
                            throw err;
                            } else {
                                const token = jwt.sign(
                                    {
                                      id: result2[0].id,  
                                      email: req.body.email,
                                    },
                                    process.env.JWT_KEY,
                                    {
                                      expiresIn: "1h"
                                    }
                                  );
                                res.send({token: token});
                            }
                        });
                    } else {
                        return res.status(422).send([{field:"password", message:"Wrong password"}]);
                    }
                });
            }
        });
    }
});


router.get('/me', checkAuth, (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    
    // get variables stored in a token
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.JWT_KEY);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        let userEmail = decoded.email;
        let sql = "SELECT * FROM users WHERE email = ?";
        db.query(sql, [userEmail], (err, result) => {
            if(err){
               throw err;
            }
            res.send({id: result[0].id, phone: result[0].phone, email: result[0].email});
        });
        
    }
});


module.exports = router;