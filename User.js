var Mongodb = require('./Mongodb.js')

var register = (req, res) => {
  Mongodb.connect(Mongodb.insertUsers, req, res);
}

exports.register = register;
