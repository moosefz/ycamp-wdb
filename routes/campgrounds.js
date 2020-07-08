
// Allows the router to export the routes to the app.js file
var express = require("express");
var router = express.Router();

// DB Model import
var Campground = require("../models/campground")

// import custom middleware (as index.js file, no need to specify because its index)
var middleware = require("../middleware");

// INDEX ROUTE - SHOW ALL CAMPGROUNDS
router.get("/", function(req, res) {
	//Get all campgrounds from the DB
	Campground.find({}, function(err, allCampgrounds) {
		if(err) {
			console.log(err);
		} else {
			//This is what is returned
			res.render("campgrounds/index",
			{
				campgrounds: allCampgrounds,
				currentUser: req.user
			});
		}
	})
})

// Receives POST from form on new.ejs site. Data is parsed, added to array, pushed, and redirected to campgrounds.
// CREATE ROUTE - ADD NEW CAMPGROUND TO DATABASE - MUST BE LOGGED IN
router.post("/", middleware.isLoggedIn, function(req, res) {
	//get data from form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.desc;
	var price = req.body.price;
	// added author which is grabbed from the authenticated user
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, image: image, desc: desc, author: author, price: price};

	//Create a new Campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated) {
		if(err) {
			console.log(err); //error
		} else {
			res.redirect("campgrounds"); //redirect back to campgrounds page as a get
		}
	})
})

// NEW ROUTE - SHOW FORM TO CREATE NEW CAMPGROUND - MUST BE DECLARED BEFORE THE :id ROUTE - MUST BE LOGGED IN
router.get("/new", middleware.isLoggedIn, function(req, res) {
	res.render('campgrounds/new');
})

// SHOW ROUTE - SHOW INFORMATION ABOUT A SPECIFIC CAMPGROUND
router.get("/:id", function(req, res) {
	//Find campground with provided id
	Campground.findById(req.params.id).populate("comments").exec(function(err, campId) {
		if(err || !campId) {
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else {
			res.render("campgrounds/show", {campId: campId});
		}
	});
});

// EDIT CAMPGROUND ROUTE - runs middleware first
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if(err) {
			req.flash("error", "Campground not found.");
			res.redirect("back");
		}
		req.flash("success", "Campground updated");
		res.render("campgrounds/edit", {campground: foundCampground})	
	})
});

// UPDATE CAMPGROUND ROUTE - REQUIRES USED OF method-override
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
	// Find and update the correct campground by id
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
		if(err) {
			res.redirect("/campgrouds")
		} else {
				// Redirect to the specific show page
			res.redirect("/campgrounds/" + req.params.id)
		}
	})
})

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, async(req, res) => {
	// Find by id which is passed by the route and delete from db including comments which utilizes prehook
	try {
		let foundCampground = await Campground.findById(req.params.id);
		await foundCampground.remove(); //calls the prehook from the model
		res.redirect("/campgrounds");
	} catch (error) {
		console.log(error.message);
		res.redirect("/campgrounds");
	}
})

module.exports = router;
