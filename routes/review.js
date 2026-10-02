const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const {Review} = require("../models/reviews.js");
const {ExpressError} = require("../utils/ExpressError.js");
const {listingSchema} = require("../SchemaValidator.js");


//form to add review
router.get("/:id", (req,res,next)=>{
    let id = req.params.id;
    res.render("review.ejs",{id});
});

//submission of reviews
router.post("/:id",async(req,res,next)=>{
    try{
        console.log(req.body);
        console.log("line 21");
        let id = req.params.id;
        if(!mongoose.isValidObjectId(id))
        {
            return next(new ExpressError(400, "no such element exist"));
        }
        req.body.owner = req.user._id;
        req.body.ownername = req.user.username;
        let review = await Review.create({...req.body});
        const post = await Listing.findById(id);
        let reviews = post.reviews;
        reviews.push(review._id);
        const updatedlisting = await Listing.findByIdAndUpdate(id,{reviews:reviews},{runValidators : true,new:true});
        req.flash("success", "Hurray! your comment is added.");
        res.redirect(`/listings/${id}`);
    }catch(err){
        next(err);
    }
});

//delete a review
router.delete("/:postid/:reviewid", async(req,res,next)=>{
    try{
        let {postid , reviewid} = req.params;
        await Review.findByIdAndDelete(reviewid); 
        await Listing.findByIdAndUpdate(postid, {$pull :{reviews : reviewid}});  //$pull to remove an instance of value from an existing array.
        req.flash("deleted", "Sorry to see deleting your comment");
        res.redirect(`/listings/${postid}`);
    }catch(err){
        next(err);
    }    
});

module.exports = router;