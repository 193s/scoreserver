var mongoose = require('mongoose');
var url = 'mongodb://localhost/ctf01';

var db = mongoose.createConnection(url, function(err, res) {
  if (err) console.log('Error connected: ' + url + ' - ' + err);
  else     console.log('Success connected: ' + url);
});

exports.User = db.model('User', new mongoose.Schema({
    id        : String,
    password  : String,
    score     : Number,
    solved_challenges: Array,
}, { collection: 'user' }));

/*
exports.Problem = db.model('Problem', new mongoose.Schema({
    id        : Number,
    title     : String,
    point     : Number,
    category  : Number,
    content   : String,
    flag      : String
}, { collection: 'problem' }));
*/
