// user model
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// Initialize passport with the userSchema db
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
