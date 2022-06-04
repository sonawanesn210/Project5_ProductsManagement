const productModel=require('../models/productModel')
const validate=require('../validator/validation')
const uploadFile=require('../aws/aws')

//===============POST /products============//

const createProduct = async (req,res)=>{

    try{

 let data = req.body
 let files = req.files

 

 if(validate.isValidBody(data)){
    return res.status(400).send({ status: false, message: "Oops you forgot to enter details" });
}  

let {title,description,price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments,isDeleted}=data
//checking for title
if(!title){
    return res.status(400).send({ status: false, message: "Title is required" });
}

if (!validate.isValidField(title)) {
    return res.status(400).send({ status: false, message: "Invalid format of Title", });
  }

  let uniqueTitle= await productModel.findOne({title:title})

  if(uniqueTitle){
    return res.status(400).send({ status: false, message: `${data.title} This Title Already Exist.Please,Give Another Title` })
  }
//checking for description
if(!description){
    return res.status(400).send({ status: false, message: "description is required" });
}
if (!validate.isValidField(description)) {
    return res.status(400).send({ status: false, message: "Invalid format of description", });
  }

  if(!price){
    return res.status(400).send({ status: false, message: "price is required" }); 
  }
  if(!validate.isValidString(price) || price<=0 ){
    return res.status(400).send({ status: false, message: "Invalid Format of price it should be number and must be positive numbers" });
}  


  if(!currencyId){
    return res.status(400).send({ status: false, message: "currencyId is required" });
  }

if(currencyId.trim() !="INR"){
    return res.status(400).send({ status: false, message: "Please provide Indian currencyId" });
}

if(!currencyFormat){
    return res.status(400).send({ status: false, message: "currencyFormat is required" });
}

if(currencyFormat.trim() != "₹"){
    return res.status(400).send({ status: false, message: "Please provide correct currencyFormat" });
}

if(isFreeShipping){
    isFreeShipping = JSON.parse(data.isFreeShipping);
     if(typeof (isFreeShipping)!="boolean"){
        return res.status(400).send({ status: false, message: "Invalid Format of isFreeShipping it  must be true or false" });
    } 

}

if(!files.length){
    return res.status(400).send({ status: false, message: "productImage is required" });
}
//getting the AWS-S3 link after uploading the product's productImage
let productImageUrl = await uploadFile.uploadFile(files[0]);
data.productImage = productImageUrl;


if(style){
if(!validate.isValidStreet(style)){
    return res.status(400).send({ status: false, message: "Invalid format of style", });
}
}

if(availableSizes){
    
    if (availableSizes) {
        if (Array.isArray(validate.isValidSize(availableSizes))) {
            availableSizes = validate.isValidSize(availableSizes)
        } else {
            return res.status(400).send({ status: false, message: `size should be one these only "S", "XS", "M", "X", "L", "XXL", "XL" ` })
        }
    }
}



if(installments){
   

    if(!validate.isValidString(installments) ||installments<=0 ){
        return res.status(400).send({ status: false, message: "Invalid Format of installments it should be number and should be greater than zero" });
    }  
}

 if(isDeleted){
    isDeleted = JSON.parse(data.isDeleted);
    if(typeof isDeleted !="boolean"){
        return res.status(400).send({ status: false, message: "Invalid Format of isDeleted it  must be true or false" });  
    }

    if(isDeleted==true){
        return res.status(400).send({ status: false, message: "isDeleted must be false while creating Product"}); 
    }

} 


const product = {
    title: title,
    description: description,
    price: price,
    style:style,
    installments:installments,
    currencyId: currencyId,
    currencyFormat: currencyFormat,
    availableSizes: availableSizes,
    productImage: productImageUrl
}
let newProduct= await productModel.create(product)
return res.status(201).send({ status: true, message: "Product created successfully", data:newProduct });

}
catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }  
}

//=============GET /products=====//

const getProduct =async (req,res) =>{

  const size =req.query.size
  const name = req.query.name
  const priceGreaterThan =req.query.priceGreaterThan
  const priceLessThan = req.query.priceLessThan
  const priceSort= req.query.priceSort
  const obj = {
     
      isDeleted : false,
    
  }
  
   if(size){

          if (Array.isArray(validate.isValidSize(size))) {
              obj.availableSizes = {$in : validate.isValidSize(size)}
          } else {
              return res.status(400).send({ status: false, message: `size should be one these only "S", "XS", "M", "X", "L", "XXL", "XL" ` })
          }
      
  } 

  if(name){
  
      if (!validate.isValidField(name)) {
          return res.status(400).send({ status: false, message: "Invalid format of Name", });
        } 

        obj.title = name
  }

  if(priceGreaterThan){
  
  if(!validate.isValidString(priceGreaterThan) ||  priceGreaterThan<=0 ){
      return res.status(400).send({ status: false, message: "Invalid Format of priceGreaterThan it should be number and must be positive numbers" });
  }  
obj.price = {$gt :priceGreaterThan}

  }

  if(priceLessThan){
  
  if(!validate.isValidString(priceLessThan) || priceLessThan<=0 ){
      return res.status(400).send({ status: false, message: "Invalid Format ofpriceLessThan it should be number and must be positive numbers" });
  } 
  obj.price={$lt: priceLessThan}
  
  }

  if (priceGreaterThan && priceLessThan) {
      obj.price= { $gte: priceGreaterThan, $lte: priceLessThan }
  } 

 

if (priceSort) {
  if (priceSort == 1 && priceSort == -1) {
      const products = await productModel.find(obj)
      return res.status(200).send({ status: true, message: 'Success', data: products })
  } 


  if ((priceSort != 1 && priceSort != -1)) {
      return res.status(400).send({ status: false, message: 'To arrange in ascending order use 1 and for descending order use -1' })
  }
} 

  const productData = await productModel.find(obj).sort({price: priceSort })
  if (productData.length == 0) {
    return res.status(404).send({ status: false, message: "product not found" });
   }
  res.status(200).send({ status: true, message: "Success", data: productData  }); 
 
}


//============GET /products/:productId==============//

const getProductById = async (req,res) =>{

  try{
  let productId = req.params.productId

 if(!validate.isValidObjectId(productId)){
      return res.status(400).send({ status: false, message: "ProductId is Not Valid" });
  }

  const findProduct = await productModel.findById({_id:productId})
  if (!findProduct) return res.status(404).send({status:false, message:"no product in db"})
  if(findProduct.isDeleted==true){
    return res.status(400).send({ status: false, message: "Product is already Deleted" })
  }

    return res.status(200).send({ status: true, message: 'Product Details', data:findProduct})
  
  }
    catch (err) {
      res.status(500).send({ status: false, error: err.message })
    }
  }

//============PUT /products/:productId==================//

const updateProduct=async (req,res) =>{

  let productId = req.params.productId
  let files = req.files
  if(!validate.isValidObjectId(productId)) {
      return res.status(400).send({ status: false, message: "ProductId is Not Valid" });
    } 

   let findProduct =await productModel.findOne({_id:productId})

    if(!findProduct){
      return res.status(404).send({ status: false, message: "Prouct not found" });
    }
   
    if(findProduct.isDeleted==true) return res.status(404).send({status:false, message:"product is deleted"})


    if(!req.body.title && !req.body.description && !req.body.price  && !req.body.currencyId && !req.body.currencyFormat && !req.body.isFreeShipping && !req.files && !req.body.style  && !req.body.availableSizes  && !req.body.installments){
      return res.status(400).send({ status: false, message: "Please Provide data to update" })
    }
   
    if(req.body.title){
     
  if (!validate.isValidField(req.body.title)) {
      return res.status(400).send({ status: false, message: "Invalid format of Title", });
    }
    let uniqueTitle= await productModel.findOne({title:req.body.title})
    if(uniqueTitle){
      return res.status(400).send({ status: false, message: `${findProduct.title} This Title Already Exist.Please,Give Another Title` })
   
}
    }
 
   if(req.body.description){
      
       if (!validate.isValidField(req.body.description)) {
          return res.status(400).send({ status: false, message: "Invalid format of description", });
        }
   }


   if(req.body.price){

if(!validate.isValidString(req.body.price) || req.body.price<=0 ){
  return res.status(400).send({ status: false, message: "Invalid Format of price it should be number and must be positive numbers" });
}  
   }

   if(req.body.currencyId)  {
      
       if(req.body.currencyId.trim() !="INR"){
          return res.status(400).send({ status: false, message: "Invalid Format of currencyId" });
      }
   }

   if(req.body.currencyFormat){
      
       if(req.body.currencyFormat.trim() != "₹"){
          return res.status(400).send({ status: false, message: "Invalid Format of currencyFormat" });
      }
   }
if(req.body.isFreeShipping){
  
  req.body.isFreeShipping = JSON.parse(req.body.isFreeShipping);
   if(typeof (req.body.isFreeShipping)!="boolean"){
      return res.status(400).send({ status: false, message: "Invalid Format of isFreeShipping it  must be true or false" });
  } 
}

//getting the AWS-S3 link after uploading the product's productImage

if(files && req.files.length>0){
  let productImageUrl = await uploadFile.uploadFile(files[0]);
req.body.productImage = productImageUrl;
}

if(req.body.style){
 
  if(!validate.isValidStreet(req.body.style)){
      return res.status(400).send({ status: false, message: "Invalid format of style", });
  }
}

if(req.body.availableSizes){

  if (req.body.availableSizes) {
      if (Array.isArray(validate.isValidSize(req.body.availableSizes))) {
          req.body.availableSizes = validate.isValidSize(req.body.availableSizes)
      } else {
          return res.status(400).send({ status: false, message: `size should be one these only "S", "XS", "M", "X", "L", "XXL", "XL" ` })
      }
  }
}

if(req.body.installments){
  
  if(!validate.isValidString(req.body.installments) ||req.body.installments<=0 ){
      return res.status(400).send({ status: false, message: "Invalid Format of installments it should be number and should be positive number" });
  }  
}

let updateProduct = await productModel.findOneAndUpdate({_id:productId},req.body,{new:true})
return res.status(200).send({ status: true, message:"Success", data: updateProduct })
}






//===================================DELETE /products/:productId========================================//

  const deleteProduct=async function(req,res){
    try{
         let id=req.params.productId
         if(!validate.isValidObjectId(id)){
           return res.status(400).send({status:false, msg:"ProductId is not valid"})
         }
       const  checkId= await productModel.findById({_id:id})
       if(!checkId)
       return res.status(404).send({status:false,msg:" This productId is not exist"})

       if(checkId.isDeleted==true)
       return res.status(404).send({status:false,msg:"This product might have been deleted already"})

        await productModel.findByIdAndUpdate({_id:id},{isDeleted:true, deletedAt:new Date()},{new:true})
        return res.status(200).send({status:true, message:"Product deletion is successful"})
    }
    catch(err){
      return res.status(500).send({status:false,msg:err})
    }
  }





module.exports={createProduct,getProduct,getProductById,updateProduct,deleteProduct}

