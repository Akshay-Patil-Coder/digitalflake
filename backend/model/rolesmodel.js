const mongoose = require('mongoose')
const userschema = mongoose.Schema({

    name:{type:String,required:true,unique:true},

    status:{type:String,default:"Active"},

},{
    timestamps:true,
})


const Role =   mongoose.model("Role",userschema)
module.exports = Role;