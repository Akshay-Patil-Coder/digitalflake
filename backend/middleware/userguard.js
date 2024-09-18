const jwt = require('jsonwebtoken');


const protect = (req,resp,next)=>{
    const result = localStorage.getItem("Token")
    const newtoken = result.token;
    const decoded = jwt.verify(newtoken, "hellomynameisakshay");
    if(result.id == newtoken.id){
        next()
    }
    else{
        resp.send('error to authenticated')
    }

}


module.exports = {protect}; 