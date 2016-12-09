var Mongodb = require('./Mongodb.js')

var register = (req, res) => {
  Mongodb.connect(Mongodb.insertUsers, req, res);
}

var login = (req, res) => {
  Mongodb.connect(Mongodb.findUsers, req, res);
}

exports.register = register;
exports.login = login;
