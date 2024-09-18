const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const userschema = mongoose.Schema({

    name:{type:String,required:true},

    mobileno:{type:Number,required:true,unique:true},

    email:{type:String,required:true,unique:true},
    
    status:{type:String,required:true},

    role:{type:String,required:true},

    password:{type:String,required:true},

    pic:{type:String,default:"https://cdn-icons-png.flaticon.com/512/1144/1144760.png"},
})


userschema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)

}

userschema.pre('save', async function (next) {
   
    if (!this.isModified('password')) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);  
      this.password = await bcrypt.hash(this.password, salt);  
      next(); 
    } catch (error) {
      next(error);  
    }
  });
  
const User =   mongoose.model("User",userschema)
module.exports = User;