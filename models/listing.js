const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const {Review} = require("./reviews.js");
const User = require("./user.js");

const listSchema = Schema.create(
    {
        title : {
            type:String,
            required:[true, "title is required"]
        },
        decription : {
            type:String,
            default:"This is on rent. Please check out!"
        },
        image : {
            url:{
                type:String,
            },
            filename:{
                type:String
            },
        },
        price : {
            type:Number,
            required:[true,"price is required"]
        },
        location : {
            type : String,
            required : [true, "location is needed"]
        },
        country : {
            type : String,
            required : [true, "country is needed"]
        },
        reviews:[{
            type:Schema.Types.ObjectId,
            ref:"Review"
        }],
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    }
);

listSchema.post("findOneAndDelete",async(data)=>{
    if(data)
    {
        let reviews = data.reviews;
        for(let review of reviews)
        {
            await Review.findByIdAndDelete(review);
        }
        console.log("done");
    }
});

const Listing = new model("Listing", listSchema);
module.exports = Listing;