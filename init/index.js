const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const {data} = require("./data.js");
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main().then((res)=>{
    console.log("conected");
}).catch((err)=>{
    console.log(err);
})

async function initialize(){
    await Listing.deleteMany({});
    await Listing.insertMany(data);
}

initialize().then((res)=>{
    console.log(res);
})
.catch((err)=>{
    console.log(err);
})