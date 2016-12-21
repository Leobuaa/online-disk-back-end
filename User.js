var Mongodb = require('./Mongodb.js')

exports.register = (req, res) => {
  Mongodb.connect(Mongodb.insertUsers, req, res);
}

exports.login = (req, res) => {
  Mongodb.connect(Mongodb.findUsers, req, res);
}

exports.isLogin = (req, res) => {
  const sess = req.session;
  const response = {
    success: '1',
    message: '',
    data: null,
  }
  // console.log(req.body);
  if (sess && sess.id === req.body.sessionId) {
    response.message = 'User has logged in.';
    response.data = {
      sessionId: sess.id,
    };
  } else {
    response.success = '0';
    response.message = 'User has not logged in.';
  }
  res.json(response);
}

exports.getUserInfo = (req, res) => {
  Mongodb.connect(Mongodb.getUserInfo, req, res);
}
