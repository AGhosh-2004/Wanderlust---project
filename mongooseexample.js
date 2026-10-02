const {mongoose, Schema} = require("mongoose");
const express = require("express");
const app = express();
//const cookieParser = require("cookie-parser");
const session = require("express-session"); //1. for session first install it and require
//app.use(cookieParser());
flash = require('connect-flash');
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/practice');
}

main()
.then(()=>{
    console.log("connected");
})
.catch((err)=>{
    console.log(err);
})

app.use(session({   //2. fro session  it will create a session id for a connection.
  secret : "mysupersecretstring",
  resave : false,
  saveUninitialized : true,

  cookie:{
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly : true
  }
}));

app.use(flash());  //flash middleware. for flash middleware the session middleware should be created.

app.get("/", (req,res)=>{
  req.flash("success", "test is successfull. you are great");
  res.send("test successsful");
})

app.get("/reqcount", (req,res)=>{
  if(req.session.count) //3. for session strong a variable can be generated in req.session
  {
    req.session.count++;
  }else{
    req.session.count = 1;
  }

  res.send(`${req.flash("success")} you have send request ${req.session.count} times`);
})


// const partSchema = new Schema({
//      name: { type: String, required: true },
//      sku: { type: String, required: true, unique: true },
//      cost: { type: Number, required: true }    
// });

//const Part = mongoose.model("Part", partSchema);

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   category: { type: String, required: true },
//   parts: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Part'
//   }]
// });

// productSchema.post("findOneAndDelete", async(data)=>{
//     if(data && data.parts.length > 0)
//     {
//       await Part.deleteMany({_id : {$in : data.parts}});
//     }
// })

// const Product = mongoose.model("Product", productSchema);




// async function createProduct(){
//   const bolt = await Part.create({ name: 'Hex Bolt M6', sku: 'BLT-08', cost: 1.5 });
//   const nut = await Part.create({ name: 'Hex Nut M6', sku: 'NUT-08', cost: 0.5 });

//   const chair = await Product.create({
//     name: 'Desk Chair',
//     category: 'Furniture',
//     parts: [bolt._id, nut._id]
//   });
//   console.log("after storing");
//   console.log(chair);

//   console.log("after retriving");
//   const result = await Product.findById(chair._id).populate("parts");
//   console.log(result);
// }

//createProduct();

// async function deleteProduct(){
//   await Product.findByIdAndDelete('6aa57944c8aebfe6d9f6631f');
// };

// deleteProduct();

// app.get("/",(req,res)=>{
//   console.log(req.cookies);
//   res.send("Hello i am testing on cookies");
// });

// app.get("/getcookies",(req,res)=>{
//   res.cookie("hello2","Anshumman");
//   res.send("sending some cookies");
// })

/*res.cookie() is a method to send cookies to browser. and it does stay in the browser once it is sent to browser and can be accessed by another pages
also. it can be accessed by req.cookies but for this a middleware needed cookir-parser. but only the cookie is not enough. to keep th data in browser 
express-session is required. connect.sid in the browser shows the current session id for thhe current connection. if req is send from different tabs in same browser
the session id will be same. req.session tracks the same session. wee can add any key in req.session. */

/* connect-flash  is a npm package used for flashing a message. it will be displayed to the user and after displaying it will be disappeared.
flash are the special area used for storing messages untill it is displayed to the user. for usig flash refee to the documentation in npm*/

app.listen(3000,()=>{
  console.log("server is working");
})