const listing = require("../models/listing");
function isLoggedin(req,res,next){
    if(!req.isAuthenticated())
    {
        req.session.redirectUrl = req.originalUrl;
        req.flash("deleted", "Please login first");
        return res.redirect("/user/login");
    }
    return next();
};

function saveRedirectUrl(req,res,next){
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl = req.session.redirectUrl;
    };
    next();
};

async function checkCurruser(req,res,next){
    let id = req.params.id;
    const user = await listing.findById(id);
    if(req.user._id.toString() !== user.owner._id.toString())
    {
        return res.redirect(`/listings/${id}`);
    }
    next();
};



module.exports = {isLoggedin , saveRedirectUrl, checkCurruser};