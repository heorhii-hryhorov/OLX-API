const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const fs = require('fs');
const {promisify} = require('util');
const unlinkAsync = promisify(fs.unlink);

router.get('/items', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    let sql = "SELECT products.id, products.created_at, products.title, products.price, products.image, products.user_id, users.phone, users.email FROM products JOIN users ON products.user_id=users.id";
    db.query(sql, (err, result) => {
        if(err){
           throw err;
        } else if(result.length < 1) {
            return res.status(404).send({});
        } else {
            res.send(result);
        }
    });
});

router.post('/items/', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    // check if token exists
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization,
                decoded;
            try {
                decoded = jwt.verify(authorization, process.env.JWT_KEY);
            } catch (e) {
                return res.status(401).send('unauthorized');
            }
        
        if(!req.body.title || !req.body.price) {
            return res.status(422).send([{field: "title", message: "Title is required"}]);
        }

        let user = {
            title        :   req.body.title,
            price        :   req.body.price,
            user_id      :   decoded.id
        };
        let sql = "INSERT INTO products SET ?";
        db.query(sql, user, (err, result) => {
            if(err){
                return res.status(403).send({});
            } else if(result < 1) {
                return res.status(404).send({});
            }
        });

        sql = "SELECT products.id, products.created_at, products.title, products.price, products.image, products.user_id, users.phone, users.email FROM products JOIN users ON products.user_id=users.id AND products.user_id = ? ORDER BY id DESC LIMIT 1";
        db.query(sql, decoded.id, (err, result) => {
            if(err){
                return res.status(403).send({});
            } else {
                res.send(result);
            }
        });
    }
});


router.get('/items/:id', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    let sql = "SELECT products.id, products.created_at, products.title, products.price, products.image, products.user_id, users.phone, users.email FROM products JOIN users ON products.user_id=users.id AND products.id = ?";
    db.query(sql, id, (err, result) => {
        if(err){
           throw err;
        } else if(result < 1) {
            return res.status(404).send({});
        } else {
            res.send(result);
        }
    });
});



router.put('/items/:id', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;

    // check token
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization,
                decoded;
            try {
                decoded = jwt.verify(authorization, process.env.JWT_KEY);
            } catch (e) {
                return res.status(401).send('unauthorized');
            }

            // handle resuests value
            if (req.body.title && req.body.title.length < 3) {
                res.status(422).send([{field:"title", message:"Title should contain at least 3 characters"}]);
            } else if(req.body.price && !req.body.title) {
                let sql = "UPDATE products SET price = ? WHERE id = ? AND user_id = ?";
                db.query(sql, [req.body.price, id, decoded.id], (err, result) => {
                    if(err){
                        return res.status(404).send({});
                    } else if(result < 1) {
                        return res.status(404).send({});
                    } else {
                        let sql = "SELECT products.id, products.created_at, products.title, products.price, products.image, products.user_id, users.phone, users.email FROM products JOIN users ON products.user_id=users.id AND products.id = ? AND products.user_id=?";
                        db.query(sql, [id, decoded.id], (err, result) => {
                            if(err){
                                return res.status(404).send({});
                             } else if(result < 1) {
                                return res.status(404).send({});
                             } else {
                                 res.send(result);
                             }
                        });
                    }
                });

            } else if(req.body.title && !req.body.price) {
                let sql = "UPDATE products SET title = ? WHERE id = ? AND user_id = ?";
                db.query(sql, [req.body.title, id, decoded.id], (err, result) => {
                    if(err){
                        return res.status(404).send({});
                    } else if(result < 1) {
                        return res.status(404).send({});
                    } else {
                        let sql = "SELECT products.id, products.created_at, products.title, products.price, products.image, products.user_id, users.phone, users.email FROM products JOIN users ON products.user_id=users.id AND products.id = ? AND products.user_id = ?";
                        db.query(sql, [id, decoded.id], (err, result) => {
                            if(err){
                                return res.status(404).send({});
                             } else if(result < 1) {
                                return res.status(404).send({});
                             } else {
                                 res.send(result);
                             }
                        });
                    }
                });

            } else if(req.body.title && req.body.price) {
                let sql = "UPDATE products SET price = ?, title = ? WHERE id = ? AND user_id = ?";
                db.query(sql, [req.body.price, req.body.title, id, decoded.id], (err, result) => {
                    if(err){
                        return res.status(404).send({});
                    } else if(result < 1) {
                        return res.status(404).send({});
                    } else {
                        let sql = "SELECT products.id, products.created_at, products.title, products.price, products.image, products.user_id, users.phone, users.email FROM products JOIN users ON products.user_id=users.id AND products.id = ? AND products.user_id=?";
                        db.query(sql, [id, decoded.id], (err, result) => {
                            if(err){
                                return res.status(404).send({});
                             } else if(result < 1) {
                                return res.status(404).send({});
                             } else {
                                 res.send(result);
                             }
                        });
                    }
                });
            }
    }
});


router.delete('/items/:id', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization,
                decoded;
            try {
                decoded = jwt.verify(authorization, process.env.JWT_KEY);
            } catch (e) {
                return res.status(401).send('unauthorized');
            }
            let sql = "DELETE FROM products WHERE id = ? AND user_id = ?";
            db.query(sql, [id, decoded.id], (err, result) => {
                if(err){
                    return res.status(403).send({});
                } else if(result.affectedRows != 1) {
                    return res.status(404).send({});
                } else {
                    res.send({});
                }
            });
    }
});

// Add configs to multer upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads');
    },
    filename: function(req, file, cb) {
      let today = new Date();
      cb(null,  today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds() + '-' + file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 2
    },
    fileFilter: fileFilter
  });


router.post('/items/:id/images', upload.single('file'), async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    var id = req.params.id;
    // check token
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization,
                decoded;
            try {
                decoded = jwt.verify(authorization, process.env.JWT_KEY);
            } catch (e) {
                return res.status(401).send('unauthorized');
            }
            if(req.file.size > (1024 * 1024 * 2)) {
                // delete file from server if too big
                await unlinkAsync(req.file.path);
                
                return res.status(422).send([{field: "image", message: `The file ${req.file.originalname} is too big`}]);
            }
            let sql = "UPDATE products SET image = ? WHERE user_id = ? AND id = ?";
            db.query(sql, [req.file.path, decoded.id, id], (err, result) => {
                if(err){
                    return res.status(403).send({});
                } else if(result < 1) {
                    return res.status(404).send({});
                }
            });

            sql = "SELECT products.id, products.created_at, products.title, products.price, products.image, products.user_id, users.phone, users.email FROM products JOIN users ON products.user_id=users.id AND products.user_id = ? AND products.id = ?";
            db.query(sql, [decoded.id, id], (err, result) => {
                if(err){
                    return res.status(403).send({});
                } else if(result < 1) {
                    return res.status(404).send({});
                } else {
                    res.send(result);
                }
            });
    }
});

module.exports = router;