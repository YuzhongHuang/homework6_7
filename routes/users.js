// Routes relating to users
var userroutes = {};
// new user
var newuser = function(req, res) {
  res.render("home");
};
userroutes.new = newuser;

module.exports = userroutes;
