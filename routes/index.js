var express = require("express"),
	passport = require("passport"),
	User = require("../models/user");
		
var router = express.Router();


//ROOT route
router.get("/", function(req,res){
	res.render("landing");
});

//Show register form
router.get("/register", function(req, res){
	res.render("register", {page: 'register'});
});

//Handle signup logic
router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			console.log(err);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success","Welcome, " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

//login route
router.get("/login", function(req, res){
	res.render("login", {page: 'login'});
});

//Handle signin logic
router.post("/login", passport.authenticate("local", {
	
	successRedirect: "/campgrounds",
	failureRedirect: "/login",
	successFlash: "Welcome!" 

	}), function(req, res){});

//Logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out");
	res.redirect("/campgrounds");
});



module.exports = router;