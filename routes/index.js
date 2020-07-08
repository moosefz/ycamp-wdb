// =====================
// AUTH ROUTES
// =====================

// Allows the router to export the routes to the app.js file
var express = require("express");
var router = express.Router();

// Passport
var passport = require("passport");

// User db model
var User = require("../models/user");

// ROOT ROUTE
router.get("/", function(req, res) {
	res.render("landing");
});

// Registration
router.get("/register", function(req, res) {
	res.render("register");
})

//Sign up logic
router.post("/register", function(req, res) {
	// extract username and password and call register() to save to db. This also encodes the password using passport
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user) {
		if(err) {
			req.flash("error", err.message); // passport handles the error
			return res.redirect("register"); // send to register page
		}
		// on success, login and go to campgrounds page
		passport.authenticate("local")(req, res, function() {
			req.flash("success", "Welcome to YelpCamp " + user.username + "!");
			res.redirect("/campgrounds");
		})
	});
})

// Login Form
router.get("/login", function(req, res) {
	res.render("login");
})

// Handling Login Logic - passport authenticates cred. on db
router.post("/login", passport.authenticate("local",
	{
		successRedirect: "/campgrounds", //success
		failureRedirect: "/login", //fail
	}), function(req, res) {
		//callback not needed
});

// Logout Route
router.get("/logout", function(req, res) {
	req.logout(); //passport function
	req.flash("success", "Logged out.");
	res.redirect("/campgrounds");
})

module.exports = router;
