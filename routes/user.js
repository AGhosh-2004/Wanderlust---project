const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { Review } = require("../models/reviews.js");
const { ExpressError } = require("../utils/ExpressError.js");
const { listingSchema } = require("../SchemaValidator.js");
const User = require("../models/user.js");
const passport = require("passport");
const { isLoggedin, saveRedirectUrl } = require("../middleware/middlewares.js");


router.get("/signup", (req, res, next) => {
    res.render("users/signup.ejs");
})

router.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username: username, email: email });
        let registereduser = await User.register(user, password);
        req.login(registereduser, (err) => {
            if (err) {
                return next(err);
            };
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        })
    } catch (err) {
        req.flash("deleted", err.message);
        res.redirect("/user/signup");
    }
})

router.get("/login", saveRedirectUrl, (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/listings");
    }
    res.render("users/login.ejs");
});

router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/user/login", failureFlash: true }), async (req, res, next) => {
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect(res.locals.redirectUrl || "/listings");
    });

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "You are logged out. See you soon!");
        res.redirect("/listings");
    });
});
// ==============================================================================
// GET /user/dashboard - Host Analytics & Management Dashboard
// ==============================================================================
// Why this is written:
// When a logged-in user clicks "Host Dashboard" in the navbar user menu,
// this route loads their specific listings, calculates their unique locations count,
// collects all customer reviews received across their stays, and computes their
// overall average host rating to display on views/users/dashboard.ejs.
router.get("/dashboard", isLoggedin, async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Step 1: Find all listings created by this logged-in host
        const listings = await Listing.find({ owner: userId }).populate("reviews").lean();
        listings.forEach(element => {
            if (typeof element.image === "object" && element.image) {
                element.imageurl = element.image.url;
            } else {
                element.imageurl = element.image;
            }
        });

        // Step 2: Calculate how many unique cities/locations the user hosts in
        const locationsSet = new Set(listings.map(l => l.location).filter(Boolean));
        const locationsCount = locationsSet.size;

        // Step 3: Collect all reviews written by guests for this user's stays
        let allReviews = [];
        listings.forEach(l => {
            if (l.reviews && Array.isArray(l.reviews)) {
                l.reviews.forEach(r => {
                    allReviews.push({ ...r, listingTitle: l.title, listingId: l._id });
                });
            }
        });

        // Step 4: Calculate the host's overall average star rating
        let avgRating = 0;
        if (allReviews.length > 0) {
            const sum = allReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
            avgRating = (sum / allReviews.length).toFixed(1);
        }

        // Step 5: Render views/users/dashboard.ejs with all calculated metrics
        res.render("users/dashboard.ejs", {
            user: req.user,
            listings,
            allReviews,
            otherUserReviews: allReviews,
            avgRating,
            locationsCount
        });
    } catch(err) {
        next(err);
    }
});

module.exports = router;