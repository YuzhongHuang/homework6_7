// external requirements
var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require('express-session');
var exphbs = require('express-handlebars')
var mongoose = require("mongoose");

var module_exists = function(name) {
  try {
    var modloc = require.resolve(name);
    return true;
  } catch (e) {
    return false;
  }
};

// internal requirements
var tweee = require("./routes/tweee");
var users = require("./routes/users");
var authrs = require("./routes/auth");
if (module_exists('./oauth.js')) {
  var config = require('./oauth.js');
}
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;

// app creation & configuration
var app = express();

var PORT = process.env.PORT || 3000;
var mongoURI = process.env.MONGOURI || "mongodb://localhost/test";
var fbclientID = process.env.FBCID || config.facebook.clientID;
var fbclientsecret = process.env.FBCSR || config.facebook.clientSecret;
var fbcallbackurl = process.env.FBCBU || 'http://localhost:3000/auth/facebook/callback';

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

var models = require("./models/models");
var authUser = models.authUser;

// passport config
passport.use(new FacebookStrategy({
  clientID: fbclientID,
  clientSecret: fbclientsecret,
  callbackURL: fbcallbackurl
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    authUser.findOrCreate({
      'facebook.id': profile.id
    }, {
      'facebook.name': profile.displayName,
      'facebook.profilelink': profile.profileUrl,
      'name': profile.displayName
    }, function(err, user) {
      if (err) {
        return done(err, user);
      } else {
        return done(null, user);
      }
    });
  });
}));

passport.use(new LocalStrategy(
  function(username, password, done) {
    authUser.findOrCreate({
      'local.username': username
    }, {
      'name': username,
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        users.makeuser(username);
        return done(donereturn.err, donereturn.ret);
      }
      if (!user.verifyPassword(password, user)) {
        return done(null, false);
      }
      return done(null, user);
    });
  }
));

var ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// passport serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, {
    name: user.name,
    id: user._id
  });
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// routes
app.get('/', ensureAuthenticated, tweee.home);

app.get('/login', authrs.login);
app.post('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.post('/users/auth/local',
  passport.authenticate('local', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/');
  });


app.post('/users/new/', users.new);

app.post('/tweee/new/', tweee.new);
app.delete('/tweee/delete/', tweee.delete);


app.get('/auth/facebook/',
  passport.authenticate('facebook', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/'
  }),
  function(req, res) {
    res.redirect('/');
  });
// connections
mongoose.connect(mongoURI);
app.listen(PORT, function() {
  console.log("Application running on port:", PORT);
});
