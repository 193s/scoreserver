var express = require('express');
var R       = require('ramda');
var YAML    = require('yamljs');
var marked  = require('marked');

var router  = express.Router();
var User = require('../model').User;
var sess = require('../session');

var fetch_challenges = function() {
  var ret = YAML.load(__dirname + '/../data/challenges.yaml');
  for (i in ret) ret[i]['id'] = i;
  return ret;
};
var fetch_categories = function() { return YAML.load(__dirname + '/../data/categories.yaml'); };


var render_challenges = function(req, res, stat) {
  /*
  if (stat == 'wrong') { }
  else if (stat == 'correct') { }
  else if (stat !== undefined) {
    console.log('render_challenges: error');
    return;
  }
  */
  User.findOne({ id: req.session.username }, function(err, data) {
    var probs = fetch_challenges();
    var categ = fetch_categories();
    res.render('challenges', {
      currentPath: '/challenges', problems: probs, categories: categ,
      md: marked, 'status': stat, 'session': req.session, user_data: data
    });
  });
};


// Flag Submission
router.post('/submit/:challenge_id', function(req, res) {
  var ch_id = req.params.challenge_id;
  var probs = fetch_challenges();
  console.log(probs);
  console.log(ch_id);
  var exists = R.contains(ch_id)(Object.keys(probs));
  // validate id
  if (!exists) {
    res.status(404);
    res.send('No such id: ' + ch_id);
    return;
  }

  var input_flag = req.body.flag;
  var prob = probs[ch_id];

  // Correct
  if (input_flag == prob.flag) {
    // add score
    var user = req.session.username;
    console.log('add score to', user);
    User.findOne({ id: user }, function(err, data) {
      // check if the user has already solved that problem
      if (R.contains(ch_id)(data.solved_challenges)) {
        // already solved
        console.log('already solved');
        render_challenges(req, res, 'already');
      }
      else {
        var scoreNow = data.score;
        var scoreD = scoreNow + prob.point;
        console.log('now', scoreNow);
        console.log('->', scoreD);
        var solves = data.solved_challenges;
        solves.push(ch_id);
        console.log('solves:', solves);
        // add to solved_challenges & score
        User.update({ id: user },
            {$set: {score: scoreD, solved_challenges: solves}},
            {},
          function(err, data) {
          console.log(data);
          render_challenges(req, res, 'correct');
        });
      }
    })
  }
  // Incorrect
  else {
    render_challenges(req, res, 'wrong');
  }
});


// Challenges
router.get('/challenges', function(req, res) {
  render_challenges(req, res);
});


module.exports = router;
