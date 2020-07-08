// Allows the router to export the routes to the app.js file
var express = require("express");
var router = express.Router();

// DB Model import
var Campground = require("../models/campground")

// import custom middleware (as index.js file, no need to specify because its index)
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options = {
	provider: "google",
	httpAdapter: "https",
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

var geocoder = NodeGeocoder(options);

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

	geocoder.geocode(req.body.location, function(err,data) {
		if(err || !data.length) {
			req.flash("error", "Invalid Address");
			return res.redirect("back");
		}

		// collect geocoded data
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		var newCampground = {name: name, image: image, desc: desc, author: author, price: price, lat: lat, lng: lng, location: location};

		//Create a new Campground and save to DB
		Campground.create(newCampground, function(err) {
			if(err) {
				console.log(err); //error
			} else {
				res.redirect("campgrounds"); //redirect back to campgrounds page as a get
			}
		});
	});	
});

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
	geocoder.geocode(req.body.location, function(err, data) {
		if(err || !data.length) {
			req.flash("error", "Invalid Address");
			res.redirect("back");
		}

		// collect geocoded data
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;

		Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
			if(err) {
				req.flash("error", err.message);
				res.redirect("/campgrouds")
			} else {
				req.flash("success", "Successfully Updated!");
				// Redirect to the specific show page
				res.redirect("/campgrounds/" + updatedCampground._id)
			}
		});
	});
});

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
