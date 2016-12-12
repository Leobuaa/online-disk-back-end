var Mongodb = require('./Mongodb.js')

exports.addItem = (req, res) => {
  Mongodb.connect(Mongodb.addItem, req, res);
}
