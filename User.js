var Mongodb = require('./Mongodb.js')

var register = (req) => {
  Mongodb.connect(Mongodb.insertUsers, req);
}

exports.register = register;
