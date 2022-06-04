const userModel=require('../models/userModel')
const validate=require('../validator/validation')
const jwt=require('jsonwebtoken')


//.........................MIDDLEWARE-FOR AUTHENTICATION..........................................................

const authentication= async (req,res,next) =>{
    try{
    let bearerToken= req.headers['authorization'];
    if(!bearerToken) return res.status(400).send({ status: false, message: "Please, provide the token" });
  
   
    let bearer = bearerToken.split(' ')
    let token = bearer[1];

     let decodedToken = jwt.verify(token, "group16");
    if(!decodedToken) return res.status(403).send({ status: false, message: "Incorrect Token" })

  next(); 


  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }};

//..........................MIDDLEWARE-FOR AUTHORIZATION..........................................................

const authorization=async (req,res,next) =>{
    try{
        let bearerToken= req.headers['authorization'];
        if(!bearerToken) return res.status(400).send({ status: false, message: "Please, provide the token" });

    let bearer = bearerToken.split(' ')
    let token = bearer[1];

    let userId=req.params.userId
    if(!validate.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "UserId is Not Valid" });
      }
      const findUser = await userModel.findById({_id:userId})
      
      if(!findUser){
        return res.status(404).send({ status: false, message: "User not found" });
      }

     let decodedToken = jwt.verify(token, "group16");
    if(!decodedToken) return res.status(403).send({ status: false, message: "Incorrect Token" })
    
    if (decodedToken.userId != findUser._id)
      return res.status(401).send({ status: false, msg: "authorization failed,You don't have  access"});
      next(); //if match then move the execution to next
    } catch (err) {
      res.status(500).send({ status: false, error: err.message });
    }
  };




module.exports={authentication , authorization}