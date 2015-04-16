var mongoose = require("mongoose");
var supergoose = require("supergoose");
var models = {};

// user

var userSchema = mongoose.Schema({
  name: String,
  facebook: {
    id: String,
    profilelink: String,
    name: String
  },
  keywords: [String]
});

userSchema.plugin(supergoose);

models.authUser = mongoose.model("authUser", userSchema);

// Tweee

var TweeeSchema = mongoose.Schema({
  username: String,
  userid: String,
  words: String,
  date: {
    type: Date,
    default: Date.now
  }
});
models.authTweee = mongoose.model("authTweee", TweeeSchema);


module.exports = models;
