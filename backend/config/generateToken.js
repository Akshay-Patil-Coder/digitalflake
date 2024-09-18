const jwt = require('jsonwebtoken')
const generateToken=(id)=>{
return jwt.sign({id},"hellomynameisakshay",{
    expiresIn:"30d",
});
};
module.exports = generateToken;