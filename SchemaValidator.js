const joi = require("joi");
const {ExpressError} = require("./utils/ExpressError");

const listingSchema = joi.object({
        title:joi.string().required(),
        decription:joi.string().required(),
        price:joi.number().required().min(0),
        location:joi.string().required(),
        country:joi.string().required(),
});

function validateSchema(req,res,next){
    const result = listingSchema.validate(req.body,{abortEarly:false, convert:true});
    if(result.error)
    {
        let errors = result.error.details.map((err)=>{
            return err.message;
        })
        errors = errors.join(",");
        console.log(errors);
        next(new ExpressError(400, errors));
    }
    else{
        next();
    }
}

module.exports={validateSchema};