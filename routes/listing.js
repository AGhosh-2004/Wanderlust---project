const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const {ExpressError} = require("../utils/ExpressError.js");
const {validateSchema} = require("../SchemaValidator.js");
const multer = require("multer");
const {storage} = require("../config/cloudinary.js");

const upload = multer({ storage});
const {isLoggedin , checkCurruser} = require("../middleware/middlewares.js");



// ==============================================================================
// GET /listings - Display All Listings with Optional Search Filtering
// ==============================================================================
// Why this is written:
// 1. If user visits /listings directly: displays all stay listings from MongoDB.
// 2. If user submits search in navbar from any page (e.g. /listings?search=Goa):
//    it reads req.query.search and queries MongoDB using a case-insensitive regex
//    matching title, location, or country.
router.get("/", async (req, res, next) => {
    try {
        // Step 1: Read the search parameter from the URL query string (e.g. /listings?search=Goa)
        let { search } = req.query;
        let filter = {};

        // Step 2: If the user provided a search word (not empty spaces)
        if (search && search.trim() !== "") {
            // 'i' flag means case-insensitive: matches "goa", "Goa", and "GOA"
            const regex = new RegExp(search.trim(), "i");

            // $or tells MongoDB: match documents where title, location OR country has the word
            filter = {
                $or: [
                    { title: regex },     // Match title of stay
                    { location: regex },  // Match city/location of stay
                    { country: regex }    // Match country of stay
                ]
            };
        }

        // Step 3: Query MongoDB with the filter (if filter is {}, returns all stays)
        let lists = await Listing.find(filter).lean();

        // Step 4: Normalize image URLs whether stored as string or Cloudinary object
        lists.forEach(element => {
            if (typeof(element.image) === "object") {
                element.imageurl = element.image.url;
            } else {
                element.imageurl = element.image;
            }
        });

        // Step 5: Render listings/index.ejs passing the listings array and search term
        res.render("listings/index.ejs", { lists, searchQuery: search || "" });
    } catch(err) {
        next(err);
    }
});

//form for nnew listing
router.get("/new",isLoggedin,(req,res)=>{
    res.render("listings/form.ejs");
});

//submission of new listing
router.post("/",isLoggedin,upload.single('image'),validateSchema,async(req,res,next)=>{
    try{                                    //with multer req.file is used access the file and req.file is a object
        req.body.owner = req.user._id;
        req.body.image={
            url:req.file.path,
            filename:req.file.filename
        };
        let result = await Listing.create({...req.body});
        req.flash("success","Your post is listed!");
        res.redirect("/listings");
    }catch(err){
        next(err);
    }
});

//show a listing
router.get("/:id", async(req,res,next)=>{
    try{
        let id = req.params.id;
        let data = await Listing.findById(id).populate("reviews").populate("owner").lean();
        if(data === null)
        {
            req.flash("deleted", "Data cannot be found. It's our mistake");
            return res.redirect("/listings");
        }
        if(typeof(data.image) === "object")
        {
            data.imageurl = data.image.url;
        }
        else{
            data.imageurl = data.image;
        }
        res.render("listings/show.ejs",{data});
    }catch(err){
        //next(err);
    }
});

//form for editing a listing 
router.get("/:id/edit",isLoggedin,checkCurruser,async(req,res,next)=>{
    try{
        let id = req.params.id;
        if(!mongoose.isValidObjectId(id))
        {
            next(new ExpressError(400, "no such element exist"));
        }
        let data = await Listing.findById(id).lean().orFail(
            ()=>{
                next(new ExpressError(400, "no such element exist"));
            }
        );
        if(typeof(data.image) === "object")
        {
            data.imageurl = data.image.url;
        }
        else{
            data.imageurl = data.image;
        }
        res.render("listings/edit.ejs",{data});
    }catch(err){
        next(err);
    }
});

//updating a listing
router.put("/:id",isLoggedin,checkCurruser,upload.single("image"),validateSchema,async(req,res,next)=>{
    try
    {
        if(!mongoose.isValidObjectId(req.params.id))
        {
            next(new ExpressError(400, "no such element exist"));
        }
        if(req.file)
        {
            req.body.image = {
                url:req.file.path,
                filename:req.file.filename
            }
        }
        await Listing.findByIdAndUpdate(req.params.id, {
            ...req.body
        },{
            runValidators:true
        });
        res.redirect(`/listings/${req.params.id}`);
    }catch(err)
    {
        next(err);
    }
});

//delete a listing
router.delete("/:id",isLoggedin,checkCurruser,async(req,res,next)=>{
    try
    {
        let id = req.params.id;
        if(!mongoose.isValidObjectId(id))
        {
            next(new ExpressError(400, "no such element exist in database"));
        }
        await Listing.findByIdAndDelete(id);
        req.flash("deleted", "your listing is deleted");
        res.redirect("/listings");
    }catch(err)
    {
        next(err);
    }
});


module.exports = router;