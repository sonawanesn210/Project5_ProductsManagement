const userModel=require('../models/userModel')
const validate=require('../validator/validation')
const bcrypt=require('bcrypt')
const uploadFile=require('../aws/aws')
const jwt=require('jsonwebtoken')

//Create User
const createUser=async (req,res) =>{
  try{
let data=req.body
let files=req.files
 
  if(validate.isValidBody(data)){
    return res.status(400).send({ status: false, message: "Oops you forgot to enter details" });
}  
 
//checking for fname
if(!data.fname){
    return res.status(400).send({ status: false, message: "First name is required" }); 
}

if (!validate.isValidField(data.fname)) {
    return res.status(400).send({ status: false, message: "Invalid format of first name", });
  }

  if(validate.isValidString(data.fname)){
    return res.status(400).send({ status: false, message: "First name should not contains number" }) }

  //checking for lname

  if(!data.lname){
    return res.status(400).send({ status: false, message: "Last name is required" }); 
}

if (!validate.isValidField(data.lname)) {
    return res.status(400).send({ status: false, message: "Invalid format of Last name", });
  }

  if(validate.isValidString(data.lname)){
    return res.status(400).send({ status: false, message: "Last name should not contains number" }) }

 //checking for email
 if(!data.email){
    return res.status(400).send({ status: false, message: "Email is required" }); 
}
if (!validate.isValidEmail(data.email)) {
    return res.status(400).send({ status: false, message: "Invalid Email format", });
  }

  let uniqueEmail=await userModel.findOne({email:data.email})
  if(uniqueEmail){
    return res.status(400).send({ status: false, message: `${data.email} Email Id  Already Registered.Please,Give Another Email Id` })
  }

//checking for profileImage
if(!files.length){
    return res.status(400).send({ status: false, message: "profileImage is required" }); 
}

//checking for phone
//console.log(data)
 if (!data.phone) {
  return res.status(400).send({ status: false, message: "Phone Number is required" });
} 

if (!validate.isValidPhone(data.phone)) {
    return res.status(400).send({ status: false, message: "Invalid Phone number", });
  }

  let uniquePhone=await userModel.findOne({phone:data.phone})
  if(uniquePhone){
    return res.status(400).send({ status: false, message: `${data.phone} this phone number is  Already Registered.Please,Give Another phone number` })
  }

//checking for password 
if(!data.password){
    return res.status(400).send({ status: false, message: "Password is required" }); 
}
if(!validate.isValidPassword(data.password)){
    return res.status(400).send({ status: false, message: "Password should contain at-least one number,one special character and one capital letter with length in between 8-15", })
}
  // bcrypt
  data.password = await bcrypt.hash(data.password, 10);
 

  //check for  address
  if(!(data.address)) {return res.status(400).send({ status: false, message: "Address should be present and must contain shipping and billing addresses" });
  }
  //converting into object
  data.address = JSON.parse(data.address)
 
  //validating the shipping address
  if(!data.address.shipping){
    return res.status(400).send({ status: false, message: "Shipping address is required"}) 
  } 
 
  //checking for street shipping address
  if(!data.address.shipping.street){ 
      return res.status(400).send({ status: false, message: "Street is required in shipping address" });
    }

  if(!validate.isValidStreet(data.address.shipping.street)) {
  return res.status(400).send({ status: false, message: "Invalid format of street in shipping address" });
  }

//checking for city shipping address
    if(!data.address.shipping.city){ return res.status(400).send({ status: false, message: "City is required of shipping address" });
}

if(validate.isValidString(data.address.shipping.city)) return res.status(400).send({ status: false, message: "City name should not contains number in shipping address" })

//checking for pincode shipping address
if(!data.address.shipping.pincode) {
    return res.status(400).send({ status: false, message: "Pincode is required in shipping address" });
}
if(!validate.isValidPincode(data.address.shipping.pincode)){
    return res.status(400).send({ status: false, message: "Please provide 6 digits pincode in shipping address" });
}
//validating the billing address
if(!data.address.billing){
  return res.status(400).send({ status: false, message: "billing address is required"}) 
} 


//checking for street billing address
if(!data.address.billing.street) {return res.status(400).send({ status: false, message: "Street is required in billing address" });
}

if(!validate.isValidStreet(data.address.billing.street)) {
    return res.status(400).send({ status: false, message: "Invalid format of street in billing address" });
    }

//checking for city billing address
if(!data.address.billing.city){ return res.status(400).send({ status: false, message: "City name is required of billing address" });
}

if(validate.isValidString(data.address.billing.city)) return res.status(400).send({ status: false, message: "City name should not contains number in billing address" })
//checking for pincode shipping address
if(!data.address.billing.pincode) {
    return res.status(400).send({ status: false, message: "Pincode is required in billing address" });
}
if(!validate.isValidPincode(data.address.billing.pincode)){
    return res.status(400).send({ status: false, message: "Please provide 6 digits pincode in billing address" });
}

//getting the AWS-S3 link after uploading the user's profileImage
let profileImgUrl = await uploadFile.uploadFile(files[0]);
data.profileImage = profileImgUrl;


let saveData = await userModel.create(data);
    res.status(201).send({ status: true, message: "User created successfully", data: saveData })
}
     catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }  
}


//loginUser
const loginUser=async (req,res)=>{
  try{
  let data=req.body

  if(validate.isValidBody(data)){
    return res.status(400).send({ status: false, message: "Oops you forgot to enter details" });
}  
if(!data.email){
  return res.status(400).send({ sataus: false, message: "Email is required" });
}
if (!validate.isValidEmail(data.email)) {
  return res.status(400).send({ status: false, message: "Invalid Email format", });
}
let findUser = await userModel.findOne({ email:data.email })
    if (!findUser) return res.status(404).send({ status: false, message: "User is not found" })

    // password checking
    if(!data.password){
      return res.status(400).send({ status: false, message: "Password is required" }); 
  }
  let checkPassWord = await bcrypt.compare(data.password, findUser.password);

    
  if (!checkPassWord) return res.status(400).send({ status: false, message: "Incorrect password" })

let token = jwt.sign(
      { userId: findUser._id },
      "group16", { expiresIn: '12h' }  //secreatkey
    );

    res.status(200).send({ status: true, message: "User login successfully", data: { userId: findUser._id, token: token } })
  }catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }

}



//================== GET /user/:userId/profile (Authentication required)====================//

const getUser=async (req,res)=>{
  try{
    let userId=req.params.userId
  if(!validate.isValidObjectId(userId)) {
    return res.status(400).send({ status: false, message: "UserId is Not Valid" });
  }
  const findUser = await userModel.findById({ _id: userId})
  
  if(!findUser){
    return res.status(404).send({ status: false, message: "User not found" });
  }
  
  return res.status(200).send({ status: true, message: 'User Profile Details', data:findUser})
  }
  catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
  
  }
  


//Update User
const updateUserById = async (req,res) =>{
  try{
  let userId=req.params.userId
  let files=req.files
  if(!validate.isValidObjectId(userId)) {
    return res.status(400).send({ status: false, message: "UserId is Not Valid" });
  }
  const findUser = await userModel.findById({ _id: userId})

  if(!findUser){
    return res.status(404).send({ status: false, message: "User not found" });
  }
  if (!req.body.fname && !req.body.lname && !req.body.email && !req.files && !req.body.phone && !req.body.password && !req.body.address) {
    return res.status(400).send({ status: false, message: "Please Provide data to update" })
  }

  if(req.body.fname) {
   
    if (!validate.isValidField(req.body.fname)) {
      return res.status(400).send({ status: false, message: "Invalid format of first name", });
    }

    if(validate.isValidString(req.body.fname)){
      return res.status(400).send({ status: false, message: "First name should not contains number" }) }
  } 
  if(req.body.lname){
   
    if (!validate.isValidField(req.body.lname)) {
      return res.status(400).send({ status: false, message: "Invalid format of Last name", });
    }
  
     if(validate.isValidString(req.body.lname)){
      return res.status(400).send({ status: false, message: "Last name should not contains number" }) }
 
  }

  if(req.body.email){
    
    if (!validate.isValidEmail(req.body.email)) {
      return res.status(400).send({ status: false, message: "Invalid Email format", });
    }
  
    let uniqueEmail=await userModel.findOne({email:req.body.email})
    if(uniqueEmail){
      return res.status(400).send({ status: false, message: `${req.body.email} Email Id  Already Registered.Please,Give Another Email Id` })
    }
  }

  
    //getting the AWS-S3 link after uploading the user's profileImage

  if(files && req.files.length>0){
    let profileImgUrl = await uploadFile.uploadFile(files[0]);
req.body.profileImage = profileImgUrl;
}



  if(req.body.phone){
    

    if (!validate.isValidPhone(req.body.phone)) {
      return res.status(400).send({ status: false, message: "Invalid Phone number", });
    }
  
    let uniquePhone=await userModel.findOne({phone:req.body.phone})
    if(uniquePhone){
      return res.status(400).send({ status: false, message: `${req.body.phone} this phone number is  Already Registered.Please,Give Another phone number` })
    }
  
  }

  if(req.body.password) {
    
    
    
    if(!validate.isValidPassword(req.body.password))
    {
      return res.status(400).send({ status: false, message: "Password should contain at-least one number,one special character and one capital letter with length in between 8-15", })
  }
    // bcrypt
    req.body.password = await bcrypt.hash(req.body.password, 10);
   } 

   if(req.body.address){
    req.body.address=req.body.address
   req.body.address = JSON.parse(req.body.address)
  
    let newAddress = JSON.parse(JSON.stringify(findUser.address))
   
   
    if(req.body.address.shipping){
      if(req.body.address.shipping.street){
       //findUser.address.shipping.street = req.body.address.shipping.street
 
       newAddress.shipping.street = req.body.address.shipping.street 
    
      if(!validate.isValidStreet(req.body.address.shipping.street)) {
        return res.status(400).send({ status: false, message: "Invalid format of street in shipping address" });
        }
      
      }

      if(req.body.address.shipping.city){
        // findUser.address.shipping.city = req.body.address.shipping.city 

       newAddress.shipping.city = req.body.address.shipping.city 
    

        if(validate.isValidString(req.body.address.shipping.city)) return res.status(400).send({ status: false, message: "City name should not contains number in shipping address" })

      }
      if(req.body.address.shipping.pincode){
        // findUser.address.shipping.pincode = req.body.address.shipping.pincode 
         newAddress.shipping.pincode = req.body.address.shipping.pincode 

        if(!validate.isValidPincode(req.body.address.shipping.pincode)){
          return res.status(400).send({ status: false, message: "Invalid format of pincode in shipping address" });
      }

 }

   }
   if(req.body.address.billing){
    if(req.body.address.billing.street){
      // findUser.address.billing.street = req.body.address.billing.street 
       newAddress.billing.street = req.body.address.billing.street


      if(!validate.isValidStreet(req.body.address.billing.street)) {
        return res.status(400).send({ status: false, message: "Invalid format of street in billing address" });
        }
      
      }

      if(req.body.address.billing.city){
        // findUser.address.billing.city = req.body.address.billing.city 
     
        newAddress.billing.city = req.body.address.billing.city


        if(validate.isValidString(req.body.address.billing.city)) return res.status(400).send({ status: false, message: "City name should not contains number in billing address" })
      }

      if(req.body.address.billing.pincode){
        // findUser.address.billing.pincode = req.body.address.billing.pincode 

         newAddress.billing.pincode = req.body.address.billing.pincode

        
        if(!validate.isValidPincode(req.body.address.billing.pincode)){
          return res.status(400).send({ status: false, message: "Invalid format of pincode in billing address" });
      }
      
      }
    
   }
 req.body.address=newAddress
  
}


let updateUser = await userModel.findOneAndUpdate(
  {_id: userId}, req.body,{new: true})


   return res.status(200).send({ status: true, message:" updated", data: updateUser })
 
}
 catch (err) {
  res.status(500).send({ status: false, error: err.message });
}
}; 



module.exports={createUser,loginUser,getUser,updateUserById}
