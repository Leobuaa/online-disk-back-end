var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var User = require('./User.js')

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  console.log('Request Time: ', (new Date()).toISOString());
  next();
});

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.post('/register', upload.array(), function (req, res) {
  User.register(req.body, res);
});

app.post('/login', upload.array(), function (req, res) {
  User.login(req.body, res);
});

app.listen(3001, function () {
  console.log('Example app listening on port 3001!')
})
