var express = require("express"),
	Campground = require("../models/campground"),
	middleware = require("../middleware");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

var router = express.Router();

//Index route
router.get("/", function(req,res){
	Campground.find({}, function(err,allCampgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/index", {campgrounds:allCampgrounds, page: 'campgrounds'});
		}
	});
	
});

//NEW camp route
router.get("/new", middleware.isLoggedIn, function(req,res){
	res.render("campgrounds/new");
});

//SHOW camp
router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not find");
			res.redirect("back");
		} else{
			res.render("campgrounds/show",{campground: foundCampground});
		}
	});
	
});

//CREATE camp
router.post("/", middleware.isLoggedIn, function(req,res){
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var description = req.body.description;
	
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
		  req.flash('error', 'Invalid address');
		  return res.redirect('back');
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
	
		var newCamp = {name:name, price:price, image:image, description:description, author:author};
		Campground.create(newCamp, function(err, campground){
			if(err){
				console.log(err);
			}else{
				res.redirect("/campgrounds");
			}
		});
	});
});

//EDIT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err,foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});


//UPDATE campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
	
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err,updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else{
			res.redirect("/campgrounds/" + req.params.id);
		}
		});
	});
});

//DESTROY routees
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			res.redirect("/campgrounds");
		} else{
			campground.remove();
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;