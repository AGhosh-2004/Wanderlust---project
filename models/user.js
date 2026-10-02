const { required } = require("joi");
const {mongoose, Schema, model} = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose').default;

const userSchema = new Schema({
    username:{
        type:String,
        required:[true,"username is required"]
    },
    email:{
        type:String,
        required:true,
        validate:{
            validator: function(val){
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            },
            message : "Enter a valid email"
        }
    }
});

userSchema.plugin(passportLocalMongoose,{
    usernameField: "email"
});
const User = new model("User", userSchema);
module.exports = User ; 