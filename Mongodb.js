var mongodb = require('mongodb')
var assert = require('assert')
var md5 = require('blueimp-md5')
var session = require('express-session')

var auth = (req) => {
  if (req.session.username) {
    return true;
  } else {
    return false;
  }
}

var connect = (callback, req, res) => {
  var MongoClient = mongodb.MongoClient;
  // Connection URL
  var url = 'mongodb://localhost:27017/online-disk-back-end';
  // Use connect method to connect to the Server
  MongoClient.connect(url, function(err, db) {
    // assert.equal(null, err);
    console.log("Connected correctly to db server");
    callback(db, req, res);
  });
};

var insertUsers = (db, req, res) => {
  var user = db.collection('users');
  const params = req.body;
  const response = {
    success: '1',
    message: '',
    code: '0',
    data: null,
  };

  user.insertOne({
    _id: params.username,
    username: params.username,
    email: params.email,
    password: md5(params.password),
  }, (err, result) => {
    if (err === null) {
      console.log("Insert 1 user into the users collection");
      if (result.result.ok === 1 && result.result.n === 1) {
        console.log(result.ops);
        const obj = result.ops[0];
        response.message = 'Register succeed!';
        response.data = {
          _id: obj._id,
          username: obj.username,
          email: obj.email,
        };
      }
    } else {
      console.log("Insert error occured.");
      console.log(err);
      response.success = '0';
      response.code = err.code.toString();
      response.message = err.message;
    }

    res.json(response);
  })

}

var findUsers = (db, req, res) => {
  var user = db.collection('users');
  const params = req.body;
  const response = {
    success: '1',
    message: '',
    code: '0',
    data: null,
  };

  user.findOne({
    _id: params.username
  }, (err, result) => {
    if (err === null) {
      // console.log(result);
      if (result === null) {
        response.success = '0';
        response.message = 'Login failed. Username does not exist.';
        response.code = '1';
      } else {
        if (result.password === md5(params.password)) {
          response.message = 'Login succeed.';
          response.data = {
            _id: result._id,
            username: result.username,
            email: result.email,
          };
          if (req.session) {
            req.session.username = params.username;
          }
        } else {
          response.success = '0';
          response.message = 'Login failed. Password wrong.';
          response.code = '2';
        }
      }
    }

    res.json(response);
  });
}

var addItem = (db, req, res) => {
  var fileItems = db.collection('fileItems');
  const params = req.body;

  const response = {
    success: '1',
    message: '',
    code: '0',
    data: null,
  };

  if (!auth(req)) {
    response.success = '0';
    response.message = 'User is not authenticated.';
    response.code = '1';
    res.json(response);
  }

  fileItems.insertOne(params, (err, result) => {
    if (err === null) {
      console.log('Add one file item succeed.');
      if (result.ok === 1 && result.n === 1) {
        response.data = result.ops[0];
      }
    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();
    }

    res.json(response);
  })
}

exports.connect = connect
exports.insertUsers = insertUsers
exports.findUsers = findUsers
exports.addItem = addItem
