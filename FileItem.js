var Mongodb = require('./Mongodb.js')

exports.addItem = (req, res) => {
  Mongodb.connect(Mongodb.addItem, req, res);
}

exports.getItemList = (req, res) => {
  Mongodb.connect(Mongodb.getItemList, req, res);
}
