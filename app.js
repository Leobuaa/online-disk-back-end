var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var session = require('express-session')
var User = require('./User.js')
var File = require('./FileItem.js');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(session({
  secret: '34234adf23asf4123jklefw',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  console.log('Request Time: ', (new Date()).toISOString());
  next();
});

app.get('/logout', function (req, res) {
  var sess = req.session;
  const response = {
    success: '1',
    message: 'Logout succeed.',
    data: null,
  };
  console.log(sess);
  if (sess && sess.username) {
    response.data = {
      username: sess.username,
    };
    sess.destroy((err) => {
      if (err) {
        response.success = '0';
        response.message = err.message;
      }
      res.json(response);
    });
  } else {
    res.json(response);
  }
})

app.post('/register', upload.array(), function (req, res) {
  User.register(req, res);
});

app.post('/login', upload.array(), function (req, res) {
  User.login(req, res);
});

app.post('/isLogin', upload.array(), function (req, res) {
  User.isLogin(req, res);
});

app.post('/addItem', upload.array(), function (req, res) {
  File.addItem(req, res);
});

app.get('/getItemList/:parentId', function (req, res) {
  File.getItemList(req, res);
})

app.listen(3001, function () {
  console.log('Example app listening on port 3001!')
})
