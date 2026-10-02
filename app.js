
const dotenv = require("dotenv");
dotenv .config();
const express = require("express");
const session = require("express-session");
const app = express();
const mongoose = require("mongoose");
const { MongoStore } = require("connect-mongo");
const path = require("path");
const method_override = require("method-override");
const {ExpressError} = require("./utils/ExpressError.js");
const listingsrouter = require("./routes/listing.js");
const reviewrouter = require("./routes/review.js");
const flash = require("connect-flash");


const passport = require("passport");
const localStartegy = require("passport-local");
const User = require("./models/user.js");
const userroutes = require("./routes/user.js");
const multer  = require('multer');
const dburl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wanderlust";

async function main(){
    await mongoose.connect(dburl);
}
main().then(()=>{
    console.log("conected");
}).catch((err)=>{
    console.log(err);
})

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(method_override('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter:24*3600
    }),
    cookie: {   
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days: user won't have to re-login repeatedly
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
  },
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStartegy(
    {
        usernameField: "email",
        passwordField: "password"
    },User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.deleted = req.flash("deleted");
    res.locals.curruser = req.user;
    next();
});

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});


app.use("/listings",listingsrouter);
app.use("/listings/reviews", reviewrouter);
app.use("/user",userroutes);




app.all("/{*splat}", ()=>{
    throw new ExpressError(404, "Page not found");
})

app.use((err,req,res,next)=>{
    //validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(error => error.message);

        next(
            new ExpressError(
                400,
                messages.join(", ")
            )
        );
    }

    //cast error
    else if (err.name === "CastError") {

        next(
            new ExpressError(
                400,
                `Invalid ${err.path}: ${err.value}`
            )
        );
    }
    //duplicate key error
    else if (err.code === 11000) {
    
            const field = Object.keys(err.keyValue)[0];
            const value = err.keyValue[field];
    
            next(
                new ExpressError(
                    409,
                    `${field} "${value}" already exists`
                )
            );
    }
    
    //other error
    else if (!(err instanceof ExpressError)) 
    { 
        console.error(err); 
        next(new ExpressError( 500, "Something went wrong" )); 
    }

    else{
        next(err);
    }

})

app.use((err, req, res, next)=>{
    let {status=500, message="something went wrong"} = err;
    res.status(status).send(message);
})


app.listen(8000, ()=>{
    console.log("running");
})