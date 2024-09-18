const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const cors = require("cors");
const connectDb = require("./config/db");
const User = require("./model/usersmodel");
const Role = require("./model/rolesmodel");
const generateToken = require("./config/generateToken")

connectDb();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE,HEAD,PATCH",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());


app.use(bodyParser.json());

let userOTPs = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '', //your email id here 
    pass: '', //your password here
  },
});


app.post('/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  console.log("Received email for OTP:", email);

  const otp = Math.floor(100000 + Math.random() * 900000);
  
  userOTPs[email] = {
    otp,
    expiresIn: Date.now() + 10 * 60 * 1000, 
  };
  const mailOptions = {
    from: '',//your email is here
    to: email,
    subject: 'Your OTP for password reset',
    text: `Your OTP for password reset is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending OTP:', error); 
      return res.status(500).json({ message: 'Error sending OTP', error });
    }
    console.log('OTP sent successfully to:', email); 
    return res.status(200).json({ message: 'OTP sent successfully' });
  });
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  const storedData = userOTPs[email];

  if (!storedData) {
    return res.status(400).json({ message: 'OTP not found or expired' });
  }

  if (Date.now() > storedData.expiresIn) {
    delete userOTPs[email]; 
    return res.status(400).json({ message: 'OTP has expired' });
  }

  if (storedData.otp !== parseInt(otp, 10)) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const result = await User.updateOne({email:email},{$set:{password:hashedPassword}})

  console.log(`Password for ${email} is updated to: ${hashedPassword}`);

  delete userOTPs[email];

  return res.status(200).json({ message: 'Password reset successfully' });
});

app.post("/register", async (req, resp) => {
    console.log(req.body)
  try {
    let result = await new User(req.body);
    let user = await result.save();
    resp.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
  } catch (error) {
    resp.json({error:error.message});
  }
});
app.post("/login", async (req, resp) => {
    try {
        const {email,password}=req.body;
        const user =await User.findOne({email})
        
        if(user && (await user.matchPassword(password))){
            resp.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id),
              });
        }
        else{
            resp.status(400).json("something error")
        }
        
    } catch (error) {
      resp.json({error:error.message});
    }
  });
  app.post("/createrole", async (req, resp) => {
    try {
      console.log(req.body); 
      const role = new Role(req.body); 
      const result = await role.save(); 
      resp.status(201).send(result); 
    } catch (error) {
      console.error("Error saving role:", error); 
      resp.status(500).send({ error: "Something went wrong" }); 
    }
  });
app.get("/allroles", async (req, resp) => {
  try {
    let result = await Role.find();
    resp.json(result);
  } catch (error) {
    resp.send({ error: "something error" });
  }
});
app.get("/allusers", async (req, resp) => {
  try {
    let result = await User.find();
    resp.json(result);
  } catch (error) {
    resp.send({ error: "something error" });
  }
});
app.get("/singleuser/:id", async (req, resp) => {
    try {
      let result = await User.findOne({_id:req.params.id});
      resp.json(result);
    } catch (error) {
      resp.send({ error: "something error" });
    }
 });
  app.get("/singlerole/:id", async (req, resp) => {
    try {
      let result = await Role.find({_id:req.params.id});
      resp.json(result);
    } catch (error) {
      resp.send({ error: "something error" });
    }
  });
  app.put("/updaterole/:id", async (req, resp) => {
    try {
      let result = await Role.updateOne({_id:req.params.id},{$set:req.body});
      resp.json(result);
    } catch (error) {
      resp.send({ error: "something error" });
    }
  });
  app.put("/updateuser/:id", async (req, resp) => {
    try {
      let result = await User.updateOne({_id:req.params.id},{$set:req.body});
      resp.json(result);
    } catch (error) {
      resp.send({ error: "something error" });
    }
  });
  app.delete("/deleteuser/:id", async (req, resp) => {
    try {
      let result = await User.deleteOne({_id:req.params.id});
      resp.json(result);
    } catch (error) {
      resp.send({ error: "something error" });
    }
  });
  app.delete("/deleterole/:id", async (req, resp) => {
    try {
      let result = await Role.deleteOne({_id:req.params.id});
      resp.json(result);
    } catch (error) {
      resp.send({ error: "something error" });
    }
  });


app.listen(2444, () => {
  console.log("server is connected");
});
