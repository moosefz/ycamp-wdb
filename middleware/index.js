// ALL MIDDLEWARE STORED HERE

// Required database models
var Campground = require("../models/campground");
var Comment = require("../models/comment");

// Middleware object to be exported
var middlewareObj = {};

// Checks to see if logged in user owns campground
middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
		// find the campground based on the id provided and show specific edit page
		Campground.findById(req.params.id, function(err, foundCampground) {
			if(err || !foundCampground) { //error or null item
				req.flash("error", "Campground not found");
				res.redirect("back");
			} else {
				// does user own campground, if campground author matches user id (object to string)
				if(foundCampground.author.id.equals(req.user._id)) {
					next(); //continue the method
				} else {
					req.flash("error", "You do not have permission to do that.");
					res.redirect("back");
				}
			}
		});
	} else {
		res.redirect("back"); // redirects user back to previous page
	}
}

// Checks to see if comment is owned by logged in user
middlewareObj.checkCommentOwnership = function(req, res, next) {
	if(req.isAuthenticated()) {
		// find the campground based on the id provided and show specific edit page
		Comment.findById(req.params.comment_id, function(err, foundComment) {
			if(err || !foundComment) {
				req.flash("error", "Comment not found");
				res.redirect("back");
			} else {
				// does user own comment, if comment author matches user id (object to string)
				if(foundComment.author.id.equals(req.user._id)) {
					next(); //continue the method
				} else {
					req.flash("error", "You do not have permission to do that.");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged into do that");
		res.redirect("back"); // redirects user back to previous page
	}
}

// Check to see if user is logged in as middleware
middlewareObj.isLoggedIn = function(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You must be logged in to do that."); // provides capability to access flash message on req. needs to be defined
	res.redirect("/login");
}

// export middleware
module.exports = middlewareObj; 