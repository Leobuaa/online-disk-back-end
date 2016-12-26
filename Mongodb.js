var mongodb = require('mongodb')
var assert = require('assert')
var md5 = require('blueimp-md5')
var session = require('express-session')
var helper = require('./helper.js')
var uniqid = require('uniqid')

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

// register user, and initial one root directory.
var insertUsers = (db, req, res) => {
  var user = db.collection('users');
  const params = req.body;
  const response = {
    success: '1',
    message: '',
    code: '0',
    data: null,
  };

  const obj = {
    _id: params.username,
    username: params.username,
    email: params.email,
    password: md5(params.password),
    rootDir: {
      _id: uniqid(),
      id: 'root',
      title: '全部文件',
      size: '-',
      updatedAt: helper.dateFormat(),
      type: 'directory',
      owner: params.username,
    },
  }

  user.insertOne(obj, (err, result) => {
    if (err === null) {
      console.log("Insert 1 user into the users collection");
      if (result.result.ok === 1 && result.result.n === 1) {
        console.log(result.ops);
        const obj = result.ops[0];
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

  // console.log(params);

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
            rootDir: result.rootDir,
            sessionId: req.session.id,
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
  let params = req.body;

  const response = {
    success: '1',
    message: '',
    code: '0',
    data: null,
  };

  if (!auth(req)) {
    response.success = '0';
    response.message = 'User is not authenticated.';
    response.code = '110';
    res.json(response);
    return;
  }

  params.username = req.session.username;

  fileItems.insertOne(params, (err, result) => {
    if (err === null) {
      console.log('Add one file item succeed.');
      if (result.result.ok === 1 && result.result.n === 1) {
        response.data = JSON.stringify(result.ops[0]);
      }
    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();
    }

    res.json(response);
  })
}

var getItemList = (db, req, res) => {
  var fileItems = db.collection('fileItems');
  const params = req.params;

  const response = {
    success: '1',
    message: '',
    code: '0',
    data: null,
  };

  if (!auth(req)) {
    response.success = '0';
    response.message = 'User is not authenticated.';
    response.code = '110';
    res.json(response);
    return;
  }

  fileItems.find({
    $and: [
      {isDelete: {$not: {$eq: true}}},
      {isDelete: {$not: {$eq: 'true'}}},
      {parentId: params.parentId},
      {username: req.session.username},]
  }).toArray((err, items) => {
    if (err === null) {
      response.message = 'Get the item list succeed.';
      response.data = items;
      console.log(items);
    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();
    }

    res.json(response);
  })
}

var updateItem = (db, req, res) => {
  var fileItems = db.collection('fileItems');
  const params = req.body;

  // console.log(params);

  const response = {
    success: '1',
    message: '',
    code: '0',
    data: null,
  };

  if (!auth(req)) {
    response.success = '0';
    response.message = 'User is not authenticated.';
    response.code = '110';
    res.json(response);
    return;
  }

  fileItems.findAndModify(
    {id: params.id, username: req.session.username},
    [['id', 1]],
    {$set: {title: params.title, updatedAt: params.updatedAt}},
    {new: true},
    (err, doc) => {
      if (err === null) {
        response.message = 'Update succeed.'
        response.data = doc.value;
      } else {
        response.success = '0';
        response.message = err.message;
        response.code = err.code.toString();
      }

      res.json(response);
    }
  )
}

var deleteItem = (db, req, res) => {
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
    response.code = '110';
    res.json(response);
    return;
  }

  let resData = [];
  let orArray = [];
  console.log(params);

  if (params.ids instanceof Array) {
    params.ids.map((obj) => {
      orArray.push({id: obj});
    })
  }

  fileItems.find(
    {$or: orArray}
  ).toArray((err, items) => {
    if (err === null) {
      const length = items.length;
      let cnt = 0;
      items.map((obj) => {
        fileItems.findAndModify(
          {id: obj.id, username: req.session.username},
          [['id', 1]],
          {$set: {isDelete: params.isDelete}},
          {new: true},
          (err, doc) => {
            cnt++;
            if (err === null) {
              resData.push(doc.value);
            } else {
              response.success = '0';
              response.message = err.message;
              response.code = err.code.toString();
            }
            if (cnt === length) {
              response.data = resData;
              response.message = response.message || 'Delete succeed.';
              res.json(response);
            }
          }
        )
      })
    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();

      res.json(response);
      return;
    }

  })
}

var getTrashItemList = (db, req, res) => {
  var fileItems = db.collection('fileItems');

  const response = {
    success: '1',
    message: '',
    code: '0',
    data: null,
  };

  if (!auth(req)) {
    response.success = '0';
    response.message = 'User is not authenticated.';
    response.code = '110';
    res.json(response);
    return;
  }

  fileItems.find({
    $and: [
      {username: req.session.username},
      {$or: [{isDelete: true}, {isDelete: 'true'}]},
    ]
  }).toArray((err, items) => {
    if (err === null) {
      response.message = 'Get the trash item list succeed.';
      response.data = items;
      console.log(items);
    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();
    }

    res.json(response);
  })
}

var getDirectoryList = (db, req, res) => {
  var fileItems = db.collection('fileItems');
  const params = req.body

  const response = {
    success: '1',
    message: '',
    code: '0',
    data: null,
  };

  if (!auth(req)) {
    response.success = '0';
    response.message = 'User is not authenticated.';
    response.code = '110';
    res.json(response);
    return;
  }

  fileItems.find({
    $and: [
      {isDelete: {$not: {$eq: true}}},
      {isDelete: {$not: {$eq: 'true'}}},
      {parentId: params.id},
      {type: 'directory'},
      {username: req.session.username}
    ]
  }).toArray((err, items) => {
    if (err === null) {
      response.message = 'Get directory list succeed.'
      response.data = items.filter((obj) => {
        for (let val of params.listCheckedIds) {
          if (obj.id === val) {
            return false;
          }
        }

        return true;
      })
    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();
    }

    res.json(response);
  })

}

var updateItems = (db, req, res) => {
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
    response.code = '110';
    res.json(response);
    return;
  }

  let orArray = [];
  let resData = [];
  if (params.ids instanceof Array) {
    params.ids.map((obj) => {
      orArray.push({$and: [{id: obj}, {username: req.session.username}]});
    })
  }

  fileItems.find({
    $or: orArray,
  }).toArray((err, items) => {
    if (err === null) {
      if (params.copy === true) {
        copyNewOne(items, response, resData, res, fileItems, params);
      } else {
        changeParentId(items, response, resData, res, fileItems, params);
      }
    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();
      res.json(response);
    }
  })
}

function changeParentId(items, response, resData, res, fileItems, params) {
  let orArray = [];
  items.forEach((obj) => {
    orArray.push({$and: [{id: obj.id}, {parentId: params.parentId}]});
  })

  items.forEach((obj) => {
    if (obj.parentId === params.parentId) {
      response.success = '0';
      response.code = '111';
      return false;
    }
  })

  items = items.filter((obj) => {
    if (obj.parentId === params.parentId) {
      return false;
    }
    return true;
  })

  const length = items.length;
  let cnt = 0;

  if (length === 0) {
    res.json(response);
    return;
  }

  fileItems.remove({
    $or: orArray
  }, (err, numberOfRemovedDocs) => {
    console.log('numberOfRemovedDocs: ', numberOfRemovedDocs);
    if (err === null) {
      items.map((obj) => {
        fileItems.findAndModify(
          {id: obj.id},
          [['id', 1]],
          {$set: {parentId: params.parentId}},
          {new: true, upsert: true},
          (err, doc) => {
            cnt++;
            if (err === null) {
              resData.push(doc.value);
            } else {
              response.success = '0';
              response.message = err.message;
              response.code = err.code.toString();
            }
            if (cnt === length) {
              response.data = resData;
              response.message = response.message || 'Update Items succeed.';
              res.json(response);
            }
          }
        )
      })
    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();
      res.json(response);
    }
  })

}

function copyNewOne(items, response, resData, res, fileItems, params) {
  let orArray = [];
  items.forEach((obj) => {
    orArray.push({$and: [{id: obj.id}, {parentId: params.parentId}]});
  })

  items.forEach((obj) => {
    if (obj.parentId === params.parentId) {
      response.success = '0';
      response.code = '111';
      return false;
    }
  })

  items = items.filter((obj) => {
    if (obj.parentId === params.parentId) {
      return false;
    }
    return true;
  })

  const length = items.length;
  let cnt = 0;

  if (length === 0) {
    res.json(response);
    return;
  }

  fileItems.remove({
    $or: orArray,
  }, (err, numberOfRemovedDocs) => {
    console.log('numberOfRemovedDocs: ', numberOfRemovedDocs);
    if (err === null) {
      items.map((obj) => {
        obj.parentId = params.parentId;
        delete obj._id;
        fileItems.insertOne(obj, (err, result) => {
          cnt++;
          if (err === null) {
            console.log("Insert 1 user into the fileItems collection");
            resData.push(result.ops[0]);
          } else {
            console.log("Insert error occured.");
            console.log(err);
            response.success = '0';
            response.code = err.code.toString();
            response.message = err.message;
          }

          if (cnt == length) {
            response.data = resData;
            response.message = response.message || 'Copy Items succeed.';
            res.json(response);
          }
        })
      })
    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();
      res.json(response);
    }
  })

}

var getUserInfo = (db, req, res) => {
  var users = db.collection('users');
  const params = req.body;

  const response = {
    success: '1',
    message: '',
    code: '',
    data: null,
  };

  if (!auth(req)) {
    response.success = '0';
    response.message = 'User is not authenticated.';
    response.code = '110';
    res.json(response);
    return;
  }

  users.findOne({
    username: params.username
  }, (err, result) => {
    if (err === null) {
      if (result === null) {
        response.success = '0';
        response.message = 'Username does not exist.';
      } else {
        response.message = 'Get user info succeed.';
        delete result.password;
        response.data = result;
      }
    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();
    }

    res.json(response);
  })
}

var updateUserInfo = (db, req, res) => {
  var users = db.collection('users');
  const params = req.body;

  const response = {
    success: '1',
    message: '',
    code: '',
    data: null,
  };

  if (!auth(req)) {
    response.success = '0';
    response.message = 'User is not authenticated.';
    response.code = '110';
    res.json(response);
    return;
  }

  console.log(params);

  for (let props in params) {
    console.log(props);
    if (props !== 'phone' && props !== 'email' && props !== 'gender' && props !== 'password' && props !== 'userDesc') {
      response.success = '0';
      response.message = 'User try to update invalid user info. It is refused.';
      response.code = '220';
      res.json(response);
      return;
    }
  }

  users.findAndModify(
    {username: req.session.username},
    [['id', 1]],
    {$set: params},
    {new: true},
    (err, doc) => {
      if (err === null) {
        response.message = 'Update succeed.'
        response.data = doc.value;
      } else {
        response.success = '0';
        response.message = err.message;
        response.code = err.code.toString();
      }

      res.json(response);
    }
  )
}

var updatePassword = (db, req, res) => {
  var users = db.collection('users');
  const params = req.body;

  const response = {
    success: '1',
    message: '',
    code: '',
    data: null,
  };

  if (!auth(req)) {
    response.success = '0';
    response.message = 'User is not authenticated.';
    response.code = '110';
    res.json(response);
    return;
  }

  users.findOne({
    username: req.session.username,
    password: md5(params.oldPassword)
  }, (err, result) => {
    if (err === null) {
      if (result === null) {
        response.success = '0';
        response.message = 'The old password is wrong or username does not exist.';
        response.code = '1';
        res.json(response);
      } else {
        users.findAndModify(
          {username: result.username},
          [['id', 1]],
          {$set: {password: md5(params.newPassword)}},
          {new: true},
          (err, doc) => {
            if (err === null) {
              response.message = 'Update password succeed.';
              delete doc.value.password;
              response.data = doc.value;
            } else {
              response.success = '0';
              response.message = err.message;
              response.code = err.code.toString();
            }

            res.json(response);
          }
        )
      }

    } else {
      response.success = '0';
      response.message = err.message;
      response.code = err.code.toString();
      res.json(response);
    }

  })
}

var updateAvatar = (db, req, res) => {
  var users = db.collection('users');
  const avatar = req.file;

  console.log(avatar);

  const response = {
    success: '1',
    message: '',
    code: '',
    data: null,
  };

  if (!auth(req)) {
    response.success = '0';
    response.message = 'User is not authenticated.';
    response.code = '110';
    res.json(response);
    return;
  }

  users.findAndModify(
    {username: req.session.username},
    [['id', 1]],
    {$set: {avatarURL: avatar.path}},
    {new: true},
    (err, doc) => {
      if (err === null) {
        response.message = 'Update Aavtar succeed.';
        delete doc.value.password;
        response.data = doc.value;
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
exports.getItemList = getItemList
exports.updateItem = updateItem
exports.deleteItem = deleteItem
exports.getTrashItemList = getTrashItemList
exports.getDirectoryList = getDirectoryList
exports.updateItems = updateItems
exports.getUserInfo = getUserInfo
exports.updateUserInfo = updateUserInfo
exports.updatePassword = updatePassword
exports.updateAvatar = updateAvatar
