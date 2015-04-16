var authroutes = {};

var login = function(req, res) {
  res.render('login', {
    currentuser: {
      name: "",
      _id: ""
    }
  });
};

authroutes.login = login;

module.exports = authroutes;
