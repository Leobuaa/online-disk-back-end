var mongodb = require('mongodb')
var assert = require('assert')

var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the document collection");
    callback(result);
  });
}

var insertUsers = (db, req) => {
  var user = db.collection('users');

  user.insertOne({
    _id: req.username,
    username: req.username,
    email: req.email,
    password: req.password,
  }, (err, result) => {
    if (err === null) {
      console.log("Insert 1 user into the users collection");
    }
  })

}

var connect = (callback, req) => {
  var MongoClient = mongodb.MongoClient;
  // Connection URL
  var url = 'mongodb://localhost:27017/online-disk-back-end';
  // Use connect method to connect to the Server
  MongoClient.connect(url, function(err, db) {
    // assert.equal(null, err);
    console.log("Connected correctly to db server");
    callback(db, req);
  });
};

exports.connect = connect
exports.insertUsers = insertUsers
