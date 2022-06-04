const orderModel =require('../models/orderModel')
const cartModel =require('../models/cartModel')
const validate = require('../validator/validation')
const userModel = require('../models/userModel')


//=============POST /users/:userId/orders==================//

const createOrder = async (req,res) =>{
    try{
    let data =req.body
let userId = req.params.userId

let {cartId, cancellable,status} =data

if(validate.isValidBody(data)){
    return res.status(400).send({ status: false, message: "Oops you forgot to enter details" });
}

if(!validate.isValidObjectId(userId)){
    return res.status(400).send({ status: false, message: "UsertId is Not Valid" });
} 
const findUser = await userModel.findById({ _id: userId })
if(!findUser){
    return res.status(404).send({ status: false, message: "User not found" });
  }

  if(!(cartId)){
    return res.status(400).send({ status: false, message: "cartId is Required" });  
  }
   if(!validate.isValidObjectId(cartId)){
    return res.status(400).send({ status: false, message: "cartId is Not Valid" });
  } 

  let cartExist = await cartModel.findById({_id:cartId})
  if(!cartExist){
      return res.status(404).send({status:false,message:"Cart not found"})
  }
  if(cartExist.userId != userId){
        return res.status(400).send({status:false,message:"Cart id and userId are not matched"})
  }

  if(cancellable){
       if(typeof cancellable != "boolean"){
          return res.status(400).send({status:false,message:"Cancellable should be true or false"})
      } 
      
  }

  if(status){
    let validStatus = ["pending", "completed", "canceled"]
    if(!validStatus.includes(status)){
        return res.status(400).send({status:false,message:`status should be one of this :-"pending", "completed", "canceled"`})
    }
   if(status =="completed" || status =="canceled"){
      return res.status(400).send({status:false,message:"status should be  pending while creating order"})
}
}
  let newQuantity = 0;
  for(let i = 0;i< cartExist.items.length;i++){
  newQuantity = newQuantity + cartExist.items[i].quantity

  }
  const newOrder = {
    userId:userId,
    items: cartExist.items,
    totalPrice: cartExist.totalPrice,
    totalItems: cartExist.totalItems,
    totalQuantity: newQuantity,
    cancellable,
    status
}

const order = await orderModel.create(newOrder)
    return res.status(201).send({status:true,message:"Order created successfully",data:order})


} 
catch(err){
    return res.status(500).send({status:false,message:err.message})
} 
}


//================PUT /users/:userId/orders============================//

const updateOrder = async (req,res) =>{
    let userId = req.params.userId
    let data = req.body
    let {orderId,status} =data

    if(validate.isValidBody(data)){
        return res.status(400).send({ status: false, message: "Oops you forgot to enter details" });
    }  

    if(!validate.isValidObjectId(userId)){
        return res.status(400).send({ status: false, message: "userId is Not Valid" });
    }
    let findUser = await userModel.findById({_id:userId})
    if(!findUser){
        return res.status(404).send({ status: false, message: "User not found" }); 
    }

    if(!orderId){
        return res.status(400).send({status:false,message:"OrderId is required to update order"})
    }
    if(!validate.isValidObjectId(orderId)){
        return res.status(400).send({ status: false, message: "orderId is Not Valid" });
    }

    let findOrder = await orderModel.findOne({_id:orderId,isDeleted:false})

    if(!findOrder){
        return res.status(404).send({status:false,message:"Order not found"})
    }

    if(findOrder.userId != userId ){
        return res.status(400).send({status:false,message:"Make sure UserId and OrderId are correct"})
    }

    if(!status){
        return res.status(400).send({status: false , message:"status is required to update order"})
    }
 let validStatus=["pending", "completed", "canceled"]
 if(!validStatus.includes(status)){
    return res.status(400).send({status:false,message:`status should be one of this :-"pending", "completed", "canceled"`})
}

if(findOrder.cancellable==false){
    return res.status(400).send({status:false,message:"This order is not cancellable"})
}

const updated= await orderModel.findOneAndUpdate({_id:orderId},{status:status},{new:true})
return res.status(200).send({status:true,message:"Order updated successfully", data:updated})
}


module.exports={createOrder,updateOrder}
          