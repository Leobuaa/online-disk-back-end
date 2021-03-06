var express = require('express')
var app = express()
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var uniqid = require('uniqid');
var multer = require('multer'); // v1.0.5
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname;
    const extension = originalName.substr(originalName.lastIndexOf('.'));
    cb(null, file.fieldname + uniqid() + Date.now() + extension)
  }
})
var upload = multer({ storage: storage }); // for parsing multipart/form-data
var session = require('express-session')
var User = require('./User.js')
var File = require('./FileItem.js');

var publicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/')
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname;
    const extension = originalName.substr(originalName.lastIndexOf('.'));
    cb(null, file.fieldname + uniqid() + Date.now() + extension)
  }
})

var publicUpload = multer({storage: publicStorage});

app.use('/public', express.static('public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(session({
  secret: '34234adf23asf4123jklefw',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  console.log('Request Time: ', (new Date()).toISOString());
  next();
});

app.get('/logout', function (req, res) {
  var sess = req.session;
  const response = {
    success: '1',
    message: 'Logout succeed.',
    data: null,
  };
  console.log(sess);
  if (sess && sess.username) {
    response.data = {
      username: sess.username,
    };
    sess.destroy((err) => {
      if (err) {
        response.success = '0';
        response.message = err.message;
      }
      res.json(response);
    });
  } else {
    res.json(response);
  }
})

app.post('/register', upload.array(), function (req, res) {
  User.register(req, res);
});

app.post('/login', upload.array(), function (req, res) {
  User.login(req, res);
});

app.post('/isLogin', upload.array(), function (req, res) {
  User.isLogin(req, res);
});

app.post('/addItem', upload.array('files'), function (req, res) {
  File.addItem(req, res);
});

app.get('/getItemList/:parentId', function (req, res) {
  File.getItemList(req, res);
})

app.get('/getItemList/type/:typeName', function (req, res) {
  File.getItemListByType(req, res);
})

app.get('/getTrashItemList', function (req, res) {
  File.getTrashItemList(req, res);
})

app.post('/updateItem', upload.array(), function (req, res) {
  File.updateItem(req, res);
})

app.post('/deleteItem', upload.array(), function (req, res) {
  File.deleteItem(req, res);
})

app.post('/getDirectoryList', upload.array(), function (req, res) {
  File.getDirectoryList(req, res);
})

app.post('/updateItems', upload.array(), function (req, res) {
  File.updateItems(req, res);
})

app.post('/getUserInfo', upload.array(), function (req, res) {
  User.getUserInfo(req, res);
})

app.post('/updateUserInfo', upload.array(), function (req, res) {
  User.updateUserInfo(req, res);
})

app.post('/updatePassword', upload.array(), function (req, res) {
  User.updatePassword(req, res);
})

app.post('/updateAvatar', publicUpload.single('avatar'), function (req, res, next) {
  User.updateAvatar(req, res);
})

// Todo download a list of files
app.post('/downloadList', upload.array(), function (req, res) {
  File.downloadList(req, res);
})

// single file download.
app.get('/download/uploads/:filePath', function (req, res) {
  File.download(req, res);
})

// download File by Task Id.
app.get('/downloadByTaskId/:downloadTaskId', function (req, res) {
  File.downloadByTaskId(req, res);
})

app.post('/completeDelete', upload.array(), function (req, res) {
  File.completeDelete(req, res);
})

// online show file
app.get('/uploads/:filePath', function(req, res) {
  File.showFile(req, res);
})

app.listen(3001, function () {
  console.log('Example app listening on port 3001!')
})
