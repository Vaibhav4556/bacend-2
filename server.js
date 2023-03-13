const express = require("express");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const jwt_decode = require('jwt-decode')

bodyParser = require("body-parser");
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3003;

mongoose.set("strictQuery", true);

mongoose
  .connect(
    "mongodb+srv://Vaibhav4556:vaibhav8336@cluster0.9ngzy3n.mongodb.net/user123 "
  )
  .then(() => console.log("Connected!"))
  .catch(() => console.log("connection error"));

const userSchema = new mongoose.Schema({
  email: String,
  phone:String,
  userName:String,
  profession:String,
  password: String,
  cpassword: String,
});

const User = new mongoose.model("User", userSchema);

app.post("/register", express.json(), function (req, res) {
  // res.send('This is register page')
  const { email, password,phone,profession,userName } = req.body;
  User.findOne({ email: email} || {phone:phone}, (err, user) => {
    if (user) {
      res.send({ message: "user already registered" });
    } else {
      const user = new User({
        email,
        password,
        phone,
        userName,
        profession
      });

      const saltRounds = 10;
      bcrypt.hash(password, saltRounds, function (err, hash) {
        user.password = hash;
        console.log(hash);
        user.save((err) => {
          if (err) {
            res.send(err);
          } else {
            res.status(200).send({ message: "user registerd successfully" });
          }
        });
      });
    }
  });

  // res.send(req.body)
});

//Login page

app.post("/login", express.json(), function (req, res) {
  // res.send('This is register page')
  const { email, password } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (!user) {
      // console.log("email not foundr");
      res.send({ message: "Email not found" });
    } else {
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
          res.send({ message: err });
        }
        else if(!result){
          res.send({message:"Incorrect Password"})
        }
        else {

          
          var token = jwt.sign({ user}, "asdfgmnbvc");
         
          res.send({ message: "Login successfull", token });
         
          //  console.log(token);
           
        }
      });
    }
  });
});


app.get("/content",  (req, res) => {
   
    // res.send('This is register page')
    const token = req.header("Token");
    

    try {
      jwt.verify(token, 'asdfgmnbvc', function (err, decrypt) {
      
                    res.send({
          statusCode: 200, message: {
            email: decrypt.user.email,
            phone : decrypt.user.phone,
            userName : decrypt.user.userName,
            profession : decrypt.user.profession

          }
        });
      });
    }
    catch {
      res.send({ statusCode: 404, message: "Error getting content" });
    }
   
  });


  app.get("/edit",  (req, res) => {
    
    // res.send('This is register page')
    const token = req.header("Token");
    console.log(token);

    try {
     
      const decoded = jwt.decode(token)
      console.log(decoded);
    }
    catch {
      res.send({ statusCode: 404, message: "Error getting content" });
    }
   
  });





app.get("/", function (req, res) {
  res.send({message : "Hello World"});
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
