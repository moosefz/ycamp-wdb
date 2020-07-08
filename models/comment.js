// COMMENTS
var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
	text: String,
	author: { // attaching a
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User" //refers to model
		},
		username: String
	}
});

// Model and Export
module.exports = mongoose.model("Comment", commentSchema);
