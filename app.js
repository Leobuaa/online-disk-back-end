var express = require('express')
var app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.post('/register', function (req, res) {
  const response = {
    success: 1,
    message: 'register succeed!'
  };
  res.json(response);
});

app.listen(3001, function () {
  console.log('Example app listening on port 3001!')
})
