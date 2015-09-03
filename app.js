var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var MongoStore   = require('connect-mongo')(session);
var passwordHash = require('password-hash');



var app = express();
var User = require('./model').User;
var sess = require('./session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// favicon
app.use(favicon(__dirname + '/public/favicon.png'));
// logger
app.use(logger('dev'));
// parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// Static
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'ssAsasecret',
  store: new MongoStore({
    url: 'mongodb://localhost/ctf01',
    ttl: sess.ttl
  }),
  saveUninitialized: false,
  resave: false,
  cookie: { httpOnly: true, maxAge: sess.ttl * 1000 }
}));

app.use('/admin', sess.loginCheck, require('./routes/admin'));
app.get('/login', function(req, res) {
  console.log('req_session:', req.session);
  res.render('login', { 'session': req.session });
});

app.post('/register', function(req, res) {
  var id       = req.body.id;
  var password = passwordHash.generate(req.body.password);
  console.log('register:hashed_password:', password);
  // id dup check
  User.findOne({ 'id': id }, function(err, data) {
    if (data !== null) {
      console.log('id dup');
      res.render('login', { 'status': 'duplicate', 'session': req.session });
      return;
    }
    else {
      console.log('register');
      var query = { 'id': id, 'password': password, score: 0, solved_challenges: [] };
      console.log('query', query)
      var newUser = new User(query);

      newUser.save(query, function(err) {
        console.log('mongod-user: inserted');
        if (err) console.log(err);
        res.render('login', { 'status': 'success', 'session': req.session });
        return;
      });
    }
  });
});

app.post('/login', function(req, res) {
  var id       = req.body.id;
  var raw_password = req.body.password;
  User.findOne({ 'id' : id }, function(err, data) {
    console.log('mongod-user:', data);
    if (err) console.log(err);
    // login check
    if (data !== null)
      var validpass = passwordHash.verify(raw_password, data.password);
    if (data === null || !validpass) {
      // failure
      res.render('login', { 'status' : 'wrong', 'session' : req.session });
    } else {

      // login success
      var s = req.session;

      console.log('-- POST /login --');
      // init session
      s.dummy = '1';
      s.username = id;
      s.save(function(err) { console.log('session_saved'); });

      console.log('sess', s);
      res.redirect('/');
    }
  });
});

app.post('/logout', function(req, res) {
  console.log("deleted session:", req.session);
  req.session.destroy();
  res.redirect('/');
});

app.use('/',      require('./routes/public'));
app.use('/',      sess.loginCheck, require('./routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
