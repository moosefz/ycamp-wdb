// ==========================
// COMMENT ROUTES
// ==========================

// Allows the router to export the routes to the app.js file
var express = require("express");
var router = express.Router({mergeParams: true}); //takes parameters from the other route files

// Import required db models
var Campground = require("../models/campground")
var Comment = require("../models/comment")

// import custom middleware (as index.js file, no need to specify because its index)
var middleware = require("../middleware");

// New Comment - checks for login first
router.get("/new", middleware.isLoggedIn, function(req, res) {
	//Find the campground by id
	Campground.findById(req.params.id, function(err, campground) {
		if(err) {
			console.log(err);
		} else {
			//Render the new comment page passing in the specific campground
			res.render("comments/new", {campground: campground});
		}
	})
});

// Post - New Comment - must be logged in
router.post("/", middleware.isLoggedIn, function(req, res) {
	//Find campground by id
	Campground.findById(req.params.id, function(err, campground) {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			//create new comment
			Comment.create(req.body.comment, function(err, comment) {
				if(err) {
					req.flash("error" , "Something went wrong");
					console.log(err);
				} else {
					// connect new comment to campground by adding to comment array of obj
					// add username and id to comments
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;

					// save comment to campground
					comment.save();
					campground.comments.push(comment);
					campground.save();

					//redirect campground show page
					req.flash("success", "Comment added");
					res.redirect("/campgrounds/" + campground.id);
				}
			})
		}
	})
})

// EDIT COMMENT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
	// Check to ensure that the campground is valid 
	Campground.findById(req.params.id, function(err, foundCampground) {
		if(err || !foundCampground) {
			req.flash("error", "Campground not found");
			return res.redirect("back");
		} else {
			Comment.findById(req.params.comment_id, function(err, foundComment) {
				if(err) {
					res.redirect("back");
				} else {
					// campground_id comes from the URL param, comment comes from the foundComment
					res.render("comments/edit", { campground_id: req.params.id, comment: foundComment });
				}
			})
		}
	})
})

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
	// Comment id, the updated text from the put request form
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
		if(err) {
			res.redirect("back")
		} else {
			// redirect back to the specific campground, getting the id from the route
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

// COMMENT DESTROY ROUTE 
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err) {
		if(err) {
			req.flash("error", "Something went wrong");
			res.redirect("back")
		} else {
			req.flash("success", "Comment deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

module.exports = router;
