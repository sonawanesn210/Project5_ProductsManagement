const mongoose=require('mongoose')
//

const isValid = (value) => {
    if(typeof value === "undefined" || typeof value === "null") return true;
    if(typeof value === "string" && value.trim().length == 0) return true;
    return false; 
  }


  // /STRING VALIDATION BY REJEX
const isValidField = (name) => {
    return  /^[a-zA-Z]/.test(name.trim());
  };  

 const isValidObjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
} 


const isValidBody = (reqBody) => {
  return Object.keys(reqBody).length == 0;
}
 
  const isValidString = (String) => {
    return /\d/.test(String)
  }
  
  const isValidPhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone)
  };

  //EMAIL VALIDATION BY REJEX
  const isValidEmail = (email) => {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.trim());
  };

  //PASSWORD VALIDATION BY REJEX
  const isValidPassword = (password) => {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/.test(password.trim());
  };

  //STREET VALIDATION BY REJEX
  const isValidStreet = (street) => {
    return /^[a-zA-Z0-9_.-]/.test(street);
  };

  //VALIDATION OF pincode BY REJEX
  const isValidPincode = (pincode) => {
    return /^(\d{6})$/.test(pincode)
    
  };
 //VALIDATION OF title BY REJEX
  const isValidTitle = (title) => {
    return /^[A-Za-z0-9\s\-_,\.;:()]+$/.test(title.trim())
    
  };

  
  const isValidSize = (size)=> {
   
    const validSize = size.split(",").map(x => x.toUpperCase().trim())
   
    let givenSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
  
    for (let i = 0; i < validSize.length; i++) {
      if (!givenSizes.includes(validSize[i])) {
        return false
      }
    }
    return validSize
  }
  

  
  module.exports={isValid, isValidBody,isValidString,isValidPhone,isValidEmail,isValidPassword, isValidStreet,isValidPincode,isValidField, isValidObjectId ,isValidTitle,isValidSize}
