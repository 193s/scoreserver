var express = require('express');
var R       = require('ramda');
var router  = express.Router();
var sess = require('../session');

var User = require('../model').User;

// Home
router.get('/', function(req, res) {
  res.render('index', { title: 'Demo CTF', currentPath: req.path, 'session': req.session });
});

// Scoreboard
router.get('/scoreboard', function(req, res) {
  /*
  var ranking = [
    { rank: 1, points: 5200, name: 'scryptos', path: '/teams/c2NyeXB0b3M=' },
    { rank: 2, points: 1300, name: '(null)',   path: '/teams/Cg==' },
    { rank: 3, points: 1100, name: 'PPP',      path: '/teams/UFBQ' },
    { rank: 3, points: 1100, name: 'binja',    path: '/teams/YmluamE=' }
  ];
  */

  var ranking = [];
  User.find().sort({ 'score': -1 }).exec(function(err, data) {
    for (i in data) {
      var d = data[i];
      ranking.push({
        rank: (1+parseInt(i)),
        points: d.score,
        name: d.id,
        path: '/teams/a'
      });
    }
    // console.log('ranking:', ranking);
    res.render('scoreboard', { title: 'scoreboard', currentPath: req.path, teams: ranking, 'session': req.session });
  });
});

// Team Info
router.get('/teams/:name_encoded', function(req, res) {
  var team_name = new Buffer(req.params.name_encoded, 'base64').toString();
  var team_list = [ 'scryptos', 'binja', 'PPP' ];
  var exists = R.contains(team_name)(team_list);
  if (!exists) res.status(404);
  res.render('team_info', { exists: exists, name: team_name, session: sess });
});


module.exports = router;
