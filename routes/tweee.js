// Routes related to displaying Tweee.
var path = require("path");
var models = require(path.join(__dirname, "../models/models"));
var authUser = models.authUser;
var Tweee = models.authTweee;

var routes = {};

// Main page
var home = function(req, res) {
  // find users
  authUser.find({}, '_id name')
    .sort({
      name: 1
    })
    .exec(function(err, users) {
      if (err) {
        res.status(500).send('Error gathering users');
      } else {
        //find tweees
        Tweee.find({})
          .sort({
            date: -1
          })
          .exec(function(err, tweees) {
            if (err) {
              res.status(500).send('Error gathering tweees');
            } else {
              res.render('home', {
                tweees: tweees,
                users: users,
                currentuser: {
                  name: req.user.name,
                  _id: req.user.id
                }
              });
            }
          });
      }
    });
};

routes.home = home;

// new tweee @ /tweee/new/
var newtweee = function(req, res) {
  var in_text = req.body.words;
  var in_name = req.user.name;
  var in_id = req.user.id;
  //make new tweee in db
  var newTweee = new Tweee({
    words: in_text,
    username: in_name,
    userid: in_id
  });
  newTweee.save(function(err, newTweee) {
    if (err) {
      res.status(500).send('Error creating new tweee');
    } else {
      res.render('newtweee', {
        'layout': false,
        'newTweee': newTweee
      });
    }
  });
};
routes.new = newtweee;

// delete tweee @ /tweee/delete/
var deleteTweee = function(req, res) {
  Tweee.findOneAndRemove({
    _id: req.body.orderid
  }, function(err, data) {
    if (err) {
      res.status(500).send("Error removing comment");
    } else {
      res.send(data);
    }
  });
};
routes.delete = deleteTweee;

module.exports = routes;
