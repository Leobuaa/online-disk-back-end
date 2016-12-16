var Mongodb = require('./Mongodb.js')

exports.addItem = (req, res) => {
  Mongodb.connect(Mongodb.addItem, req, res);
}

exports.getItemList = (req, res) => {
  Mongodb.connect(Mongodb.getItemList, req, res);
}

exports.updateItem = (req, res) => {
  Mongodb.connect(Mongodb.updateItem, req, res);
}

exports.deleteItem = (req, res) => {
  Mongodb.connect(Mongodb.deleteItem, req, res);
}
