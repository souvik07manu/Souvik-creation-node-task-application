const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const http = require('http');
const session = require('express-session');
const path = require('path');


// connection configurations
const mc = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'desktopcrud'
});
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// app.use(session({secret: 'juniar454500',saveUninitialized: true,resave: true}));
app.use(session({resave: true, saveUninitialized: true, secret: 'XCR3rsasa%RDHHH', cookie: { maxAge: 6000000 }}));

// app.set('view-engine', 'ejs'); 

app.set('views', path.join(__dirname, 'views'));

// Set view engine as EJS
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
 
 
// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hellodd' })
});

app.get('/ss', function (req, res) {
    return res.send({ message: 'bye' })
});

app.get('/todos', function (req, res) {
    mc.query('SELECT * FROM tasks', function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Todos list.' });
    });
});

var obj = {};
app.get('/data', function(req, res){

    mc.query('SELECT * FROM tasks',function(err,result) {

       if(!req.session.username){
            res.redirect('/login');
       }else{
        res.render('abc',{data:result , currentMenu: 'abc' , username: req.session.username}); 
       }
            //obj = {print: result};
            //console.log(obj);
             //res.render('dd.html');  
                         
        
    // });

    // res.render('dd', function (err, html) {
    //     res.send(html)
       });

});

app.get('/logout', (req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/login');
    });

});

app.get('/login', function (req, res) {
    res.render('login',{currentMenu: 'login'});
});

app.post('/loginaction', function (req, res) {
   
    var email = req.body.email;
    var password = req.body.password;

    var sql="SELECT * FROM users WHERE email='"+email+"' and password = '"+password+"'";                           
    mc.query(sql, (err,result) => {      
         if(result.length >0){
            req.session.useremail = result[0].email;
            req.session.userid = result[0].u_id;
            req.session.username = result[0].username;
           // req.session.user = result[0];
            console.log(req.session.useremail+"||"+req.session.userid+"||"+req.session.username);
            res.redirect('/data');
         }else{
             res.redirect('/login');
         }
        });

});

app.get('/register', function (req, res) {
    
    res.render('register',{currentMenu: 'register'});
});


app.post('/registeraction', function (req, res) {

    var user = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        location: req.body.location,
    }

    mc.query('INSERT INTO users SET ?', user, function(err,result) {
            
            res.redirect('/login');

    });
});


app.get('/done', function (req, res) {
    if(!req.session.username){
        res.redirect('/login');
    }else{
        res.render('mi',{currentMenu: 'topic'});
    }
    
});

app.get('/showinsert', function (req, res) {
    if(!req.session.username){
        res.redirect('/login');  
    }else{
        res.render('taskinsert',{currentMenu: 'showinsert'});
    }  
});

// create task //

app.post('/showinsertaction', function (req, res) {
    var user = {
        id: req.body.id,
        task: req.body.task,
        status: req.body.status
    }
    //console.log(user);

    mc.query('INSERT INTO tasks SET ?', user, function(err,result) {
        // if(err){
            
            res.redirect('/data');
        //}

    });
});

// end create task //



// delete task //

app.get('/delete/:id', function (req, res) {
    if(!req.session.username){
        res.redirect('/login');  
    }else{
        var id = req.params.id;
        mc.query('DELETE FROM tasks WHERE id = ?', [id], function (error, results, fields) {
        if (error) throw error;
        res.redirect('/data');
       // return res.send({ error: false, data: results, message: 'Task has been updated successfully.' });
    });
    }
    
});

// end delete task //

// edit task //

app.get('/task-edit/:id', function (req, res) {
    if(!req.session.username){
        res.redirect('/login');
   }else{
    var id = req.params.id;
    mc.query('SELECT * FROM tasks WHERE id = ?', [id], function (error, results, fields) {
       // if (error) throw error;
        if (results.length == 1) {
            res.render('edittask',{
                id: results[0].id,
                task: results[0].task,
                status: results[0].status,
                currentMenu: 'edittask'
            });
        }
    });
   }
    
});

// end edit task //

// update task  //

app.post('/updatetask', function (req, res) {
    let sql = "UPDATE tasks SET id ='"+req.body.id+"', task='"+req.body.task+"', status='"+req.body.status+"' WHERE id="+req.body.id;
       mc.query(sql, (err, results) => {
        if(err) throw err;
        res.redirect('/data');
    });
});

// end update task  //



 
// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
    console.log('Node app is running on port 8080');
});