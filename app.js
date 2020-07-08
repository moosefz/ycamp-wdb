// REQUIREMENTS
const 	express 			= require("express"),
		passport			= require("passport"),
		bodyParser 			= require("body-parser"),
		mongoose 			= require("mongoose"),
		seedDB 				= require("./seeds"),
		methodOverride		= require("method-override"),
		LocalStrategy 		= require("passport-local"),
		flash				= require("connect-flash"),

		//db models
		User 				= require("./models/user");

// =====================
// SETUP
// =====================

// Route Requirements (refactored in /routes)
var 	commentRoutes 		= require("./routes/comments"),
		campgroundRoutes 	= require("./routes/campgrounds"),
		indexRoutes 		= require("./routes/index");

// Express Configuration
var app = express();

// Mongo DB connection - Atlas or local
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/yelp_camp", {
	useNewUrlParser: true, 
	useUnifiedTopology: true,
	useCreateIndex: true
}).then(() => {
	console.log("Connected to DB")
}).catch(err => {
	console.log("ERROR: ", err.message);
})

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public")); //use public for stylesheets/scripts
app.use(methodOverride("_method")); // enable method-override for PUT requests
app.use(flash()); //use connect-flash for message prompts

// Seed the database
// seedDB();

// Session config
app.use(require("express-session")({
	secret: "YelpCamp",
	resave: false,
	saveUninitialized: false
}));

// passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// express global variable accessible on every view page
// stores currentUser/error/success vars
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error"); //if error
	res.locals.success = req.flash("success"); //if success
	next();
})

// Utilize refactored route files
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes); //
app.use("/campgrounds/:id/comments", commentRoutes);


//All other requests
app.get("*", function(req, res) {
	res.send("Invalid URL");
})

//==== LISTENER ====//
app.listen(process.env.PORT || 5000, () => {
	console.log("YelpCamp Started")
})
