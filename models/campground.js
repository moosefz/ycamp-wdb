var mongoose = require("mongoose");
const Comment = require("./comment");

// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	desc: String,
	price: String,
	location: String,
	lat: Number,
	lng: Number,
	// Associate user to campground
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

// prehook to campground model - used to delete comments from db once campground is also deleted - when .remove() is called, this prehook runs first to delete comments
campgroundSchema.pre("remove", async function() {
	await Comment.remove({
		_id: {
			$in: this.comments
		}
	});
})

//Model the Schema passing in the name and the defined schema variable
module.exports = mongoose.model("Campground", campgroundSchema);
