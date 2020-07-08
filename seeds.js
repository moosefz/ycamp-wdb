var mongoose = require("mongoose"),
	Campground = require("./models/campground"),
	Comment = require("./models/comment");

// Starter Data
var seeds = [
	{
		name: "Cloud's Rest",
		image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
		desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
	},
	{
		name: "Desert Mesa",
		image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
		desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
	},
	{
		name: "Canyon Floor",
		image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
		desc: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
	}
];

// Using async functions to ensure things occur in order
async function seedDB() {
	try {
		var cgCount = 0;

		await Campground.remove({}); //Remove all the campgrounds
		console.log("Campgrounds Removed");
		await Comment.remove({});
		console.log("Comments Removed");

	// 	//for each seed in the seeds array, do something
	// 	for(const seed of seeds) {
	// 		//Add Campgrounds
	// 		let campground = await Campground.create(seed);
	// 		//Add Comments
	// 		let comment = await Comment.create(
	// 			{
	// 				text: "This place is great, but I wish there was internet",
	// 				author: "Homer"
	// 			}
	// 		)
	// 		//Push comment to array and save
	// 		campground.comments.push(comment);
	// 		campground.save();
	//
	// 		//Counter
	// 		++cgCount;
	// 	}
	// console.log(cgCount + " campgrounds added.");

	//Catching any errors
	} catch(err) {
		console.log(err);
	}
}

module.exports = seedDB;
