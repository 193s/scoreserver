var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('admin page');
  // res.render('index', { title: 'challenges' });
});

module.exports = router;
