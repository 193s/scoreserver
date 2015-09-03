
// req.session
var logged_in = function(req, res) {
  return req.session.hasOwnProperty('dummy');
};

var loginCheck = function(req, res, next) {
  console.log('- loginCheck -');
  if (logged_in(req)) next();
  else res.redirect('/login');
};

exports.logged_in  = logged_in;
exports.loginCheck = loginCheck;
exports.ttl = 60 * 60 * 8; // 8 hour
