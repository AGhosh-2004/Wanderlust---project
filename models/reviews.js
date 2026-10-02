const { required } = require("joi");
const {mongooser, Schema, model} = require("mongoose");
const Listings = require("./listing.js");
const User = require("./user.js");

const reviewSchema = new Schema({
    comment:{
        type:String,
        required:true,
    },
    rating:{
        type:Number,
        required:true,
    },
    ownername:{
        type:String
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref : "User"
    }
},{
    timestamps:true,
});


const Review = new model("Review", reviewSchema);
module.exports = {Review};