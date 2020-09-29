const { render } = require("ejs");
//'use strict';
//var crypto = require('crypto-js');
//console.log(require('crypto').createHash('md5').update('text to hash').digest('hex'));

exports.login = function (req, res) {
    let body = req.body;
    var username = req.body.Username;
    var password = req.body.Password;
    var password = require('crypto').createHash('md5').update(password).digest('hex').toString();
    console.log(password);
    req.getConnection(function (err, connect) {
        if (username && password) {
            connect.query('SELECT * FROM dangki WHERE email = ? OR name = ? AND pass = ?', [username, username, password], function (error, results, fields) {
                //console.log(results);
                if (results.length > 0) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.ID = results[0].ID;
                    res.cookie('username', username);
                    res.cookie('ID', results[0].ID);
                    res.redirect('/index');
                } else {
                    res.render("login", {
                        mess: "Username or pass incornect!"
                    });
                }
                res.end();
            });
        } else {
            res.render('login', {
                mess: 'Please enter Username and Password!'
            });
            res.end();
        }
    });
}
exports.forgetPass = function (req, res) {
    res.render('fogetPass');
}
exports.getPass = function (req, res) {
    let body = req.body;
    var username = req.body.Username;
    var email = req.body.Email;
    var mobile = req.body.Mobile;
    req.getConnection(function (err, connect) {
        console.log("User " + username + " Quên pass vui lòng gửi pass qua mail: " + email);
        connect.query('INSERT INTO fogetpass(username, email, ngay, mobile) VALUES (?,?,curdate(),?)', [username, email, mobile]);
        var query = connect.query('SELECT count(*) as numRows FROM fogetpass where email =? and Ngay=curdate()', email, function (err, rows) {
            if (err) {
                console.log("error");
            } else {
                var numRows = rows[0].numRows;
                console.log(numRows);
                if (numRows >= 3) {
                    res.send({ mess: 'Bạn đã nhập quá nhiều lần trong ngày vui lòng chờ ngày mai' });
                } else {
                    var query = connect.query('select pass from dangki where email = ?', email, function (err, row) {
                        //giải mã pass
                        console.log(row[0].pass);
                        // gửi pass qua mail
                    });
                    res.redirect('/');
                }
            }
        });
    });
}
exports.search = function (req, res) {
    let body = req.body;
    var search = req.body.search;
    var username = req.session.username;
    //console.log(search);
    req.getConnection(function (err, connect) {
        var query = connect.query('SELECT n.ID, n.IDuser, n.name, n.title, n.contend, n.Ngay, l.numlike FROM nhatki as n JOIN likenum as l ON n.ID = l.ID WHERE n.ID = ? OR n.title = ? OR n.name=? OR n.Ngay=?', [search, search, search, search], function (err, rows) {
            if (err) {
                //console.log("Error Selecting : %s ", err);
                console.log("error");
            }
            //console.log(rows);
            res.render('index',
                { data1: rows, username: username, data: rows, numPages: 1 }
            );
        });
    });
}

exports.list = function (req, res) {
    if (!req.session.username) {
        res.redirect('/');
        return;
    } else {
        req.getConnection(function (err, connect) {
            var username = req.session.username;
            connect.query('SELECT count(*) as numRows FROM nhatki', function (err, rows, fields) {
                if (err) {
                    console.log("error");
                } else {
                    var numPerPage = 5;
                    var numRows = rows[0].numRows;
                    var numPages = parseInt(Math.ceil(numRows / numPerPage));
                    connect.query('SELECT l.numlike, l.IDuser, n.ID, n.name, n.title, n.Ngay, n.contend FROM nhatki as n JOIN likenum as l ON n.ID = l.ID limit 0,5', function (err, rows) {
                        if (err) {
                            console.log("error");
                        } else {
                            // connect.query('SELECT t.userlike FROM tablelike as t JOIN likenum as l ON t.ID = l.ID', function (err, people) {

                            // });
                            res.render('index', {
                                data: rows, data1: rows, username: username, numPages: numPages
                            });
                        }
                    });
                }
            });
        });
    }
}

exports.register = function (req, res) {
    let body = req.body;
    var username = req.body.Username;
    var password = req.body.Password;
    var password = require('crypto').createHash('md5').update(password).digest('hex').toString();
    console.log(password);
    var email = req.body.Email;
    var mobile = req.body.Mobile;
    req.getConnection(function (err, connect) {
        if (username && password && email && mobile) {
            connect.query('INSERT INTO dangki(name, pass, email, mobile) VALUES (?,?,?,?)', [username, password, email, mobile]);
            res.redirect('/');
        } else {
            res.send('Please enter Username and Password!');
            res.end();
        }
    });
}
exports.post = function (req, res) {
    var username = req.session.username;
    if (!username) {
        res.redirect("/");
    } else {
        res.render('post', {
            username: username
        });
    }

}
exports.post_list = function (req, res) {
    let body = req.body;
    var title = req.body.title;
    var contend = req.body.contend;
    var username = req.session.username;
    var ID = req.session.ID;
    console.log(ID);
    var numlike = 0;
    if (!username) {
        res.redirect("/");
    } else {
        req.getConnection(function (err, connect) {
            if (title && contend && username) {
                var query = connect.query('INSERT INTO likenum(IDuser, userpost, numlike) VALUES (?,?,?)', [ID, username, numlike]);
                var query = connect.query('INSERT INTO nhatki(IDuser, name,title, Ngay, contend) VALUES (?, ?, ?,curdate(),?)', [ID, username, title, contend]);
                res.redirect('/index');
            } else {
                res.send('Please login!');
                res.end();
            }
        });
    }
}
exports.author = function (req, res) {
    req.getConnection(function (err, connect) {
        var ID = req.session.ID;
        var username = req.session.username;
        if (!username) {
            res.redirect("/");
        } else {
            var query = connect.query('SELECT name, email, mobile from dangki WHERE ID = ?', ID, function (err, results) {
                if (err) {
                    console.log("Error! ");
                }
                var query = connect.query('SELECT d.name, d.email, d.mobile, n.ID, n.title, n.Ngay, n.contend FROM nhatki as n JOIN dangki as d ON n.IDuser = d.ID WHERE n.IDuser =?', ID, function (err, rows) {

                    //console.log(rows);
                    res.render('author', {
                        author_list: rows, author_dk: results
                    });
                });
            });

        }
    });
}
exports.update = function (req, res) {
    var username = req.session.username;
    var id = req.params.id;
    if (!username) {
        res.redirect("/");
    } else {
        req.getConnection(function (err, connect) {
            var query = connect.query('SELECT * FROM nhatki WHERE ID= ?', id, function (err, rows) {
                if (err) {
                    console.log("Error! ");
                }
                //console.log(JSON.stringify(rows).contend);
                res.render('update',
                    { username: username, id: id, data: rows }
                );
            });
        });
    }
}
exports.update_susces = function (req, res) {
    let body = req.body;
    var title = req.body.title;
    var contend = req.body.contend;
    var id = req.body.ID;
    var username = req.session.username;
    if (!username) {
        res.redirect("/");
    } else {
        req.getConnection(function (err, connect) {
            var query = connect.query('UPDATE nhatki SET title = ?,contend = ? WHERE ID = ?', [title, contend, id], function (err, rows) {
                if (err) {
                    console.log("Error! ");
                }
                //console.log(JSON.stringify(rows).contend);
                res.redirect('/author');
            });
        });
    }
}
exports.author_detail = function (req, res) {
    var name = req.params.id;
    //console.log(name);
    var username = req.session.username;
    var ID = req.session.ID;
    if (!username) {
        res.redirect("/");
    } else {
        req.getConnection(function (err, connect) {
            var query = connect.query('SELECT name, email, mobile from dangki WHERE ID = ?', name, function (err, results) {
                if (err) {
                    console.log("Error! ");
                }
                var query = connect.query('SELECT d.ID, d.name, d.email, d.mobile, n.ID, n.title, n.Ngay, n.contend FROM nhatki as n JOIN dangki as d ON n.IDuser = d.ID where d.ID =?', name, function (err, rows) {
                    //console.log(rows);
                    res.render('detail_author',
                        { detail_author: rows, data_author: results }
                    );
                });
            });
        });
    }
}
exports.list_contributer = function (req, res) {
    var username = req.session.username;
    if (!username) {
        res.redirect("/");
    } else {
        req.getConnection(function (err, connect) {
            var query = connect.query('SELECT * FROM dangki', function (err, rows) {
                if (err) {
                    console.log("Error! ");
                }
                res.render('list_author', {
                    data: rows
                });
            });
        });
    }
}
exports.logout = function (req, res) {
    delete req.session.username;
    res.redirect('/');
}
exports.delPost = function (req, res) {
    let body = req.body;
    var ID = req.body.ID;
    //console.log(ID);
    var username = req.session.username;
    if (!username) {
        res.redirect("/");
    } else {
        req.getConnection(function (err, connect) {
            if (ID) {
                connect.query('DELETE FROM nhatki WHERE ID = ?', ID);
                res.redirect('/author');
            } else {
                res.send('Please enter ID!');
                res.end();
            }
        });
    }

}
exports.detai_post = function (req, res) {
    var ID = req.params.id;
    var username = req.session.username;
    if (!username) {
        res.redirect("/");
    } else {
        req.getConnection(function (err, connect) {
            var username = req.session.username;
            var query = connect.query('SELECT n.ID, n.IDuser, n.name, n.title, n.Ngay, n.contend, l.numlike FROM nhatki as n JOIN likenum as l ON l.ID=n.ID WHERE n.ID= ?', ID, function (err, rows) {
                if (err) {
                    console.log("Error! ");
                }
                var query = connect.query('SELECT * FROM nhatki', function (err, results) {
                    if (err) {
                        console.log("Error! ");
                    }
                    // connect.query('SELECT t.userlike FROM tablelike as t JOIN likenum as l ON t.ID = l.ID where t.ID=?', ID, function (err, people) {

                    // });
                    res.render('index', {
                        data: rows, data1: rows, username: username, numPages: 1
                    });
                });

            });
        });
    }
}
exports.list_allPost = function (req, res) {
    user_like = req.session.username;
    if (!user_like) {
        res.redirect("/");
    } else {
        req.getConnection(function (err, connect) {
            var query = connect.query('SELECT * FROM nhatki', function (err, rows) {
                if (err) {
                    console.log("Error! ");
                }
                res.render('list_allPost', {
                    data: rows
                });
            });
        });
    }
}
exports.number_like = function (req, res) {
    user_like = req.session.username;
    var ID_user = req.session.ID;
    ID = req.params.id;
    if (!user_like) {
        res.redirect("/");
    } else {
        req.getConnection(function (err, connect) {
            if (ID && user_like) {
                connect.query('UPDATE likenum SET numlike = numlike+1 WHERE ID=?', ID);
                connect.query('INSERT INTO tablelike(ID, IDuser, userlike, numlike) VALUES (?,?,?,1) ', [ID, ID_user, user_like]);

                res.redirect('/index');

            } else {
                res.send('nothing!');
                res.end();
            }
        });
    }
}
exports.page = function (req, res) {
    user_like = req.session.username;
    var ID_user = req.session.ID;
    var page = parseInt(req.params.id);
    var numPerPage = 5;
    var skip = (page - 1) * numPerPage;
    var limit = skip + ',' + numPerPage; // Here we compute the LIMIT parameter for MySQL query
    if (!user_like) {
        res.redirect("/");
    } else {
        req.getConnection(function (err, connect) {
            if (ID_user && user_like) {
                connect.query('SELECT count(*) as numRows FROM nhatki', function (err, rows, fields) {
                    if (err) {
                        console.log("error");
                    } else {
                        var numRows = rows[0].numRows;
                        var numPages = parseInt(Math.ceil(numRows / numPerPage));
                        connect.query('SELECT l.numlike, l.IDuser, n.ID, n.name, n.title, n.Ngay, n.contend FROM nhatki as n JOIN likenum as l ON n.ID = l.ID limit ' + limit, function (err, rows) {
                            if (err) {
                                console.log("error");
                            } else {
                                console.log(numPages);
                                res.render('index', {
                                    data: rows, data1: rows, username: user_like, numPages: numPages
                                });
                            }
                        });
                    }
                });
            } else {
                res.send('nothing!');
                res.end();
            }
        });
    }
}

//module.exports = { list }
