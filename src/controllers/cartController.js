const cartModel = require("../models/cartModel")
const validate = require("../validator/validation")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const validator = require("../validator/validation")

//==================### POST /users/:userId/cart (Add to cart)=======================//


const createCart = async (req, res) => {
    try {
    const userId = req.params.userId;
    const data = req.body;
let {cartId,productId,quantity} = data;
if(validate.isValidBody(data)){
    return res.status(400).send({ status: false, message: "Oops you forgot to enter details" });
}  

if(!validate.isValidObjectId(userId)){
    return res.status(400).send({ status: false, message: "UsertId is Not Valid" });
}
const findUser = await userModel.findById({ _id: userId})

if(!findUser){
  return res.status(404).send({ status: false, message: "User not found" });
}

if(!productId){
    return res.status(400).send({ status: false, message: "ProductId is Required" });

}
if(!validate.isValidObjectId(productId)){
    return res.status(400).send({ status: false, message: "ProductId is Not Valid" });
} 
 
let findProduct = await productModel.findOne({_id:productId,isDeleted:false})

if(!findProduct){
    return res.status(404).send({ status: false, message: "Product not found" });
}

if(!quantity){
    quantity =1
   // return res.status(400).send({ status: false, message: "Quantity is Required" });
}
if(quantity)
if(typeof quantity != "number" || quantity<=0){
    return res.status(400).send({ status: false, message: "Enter valid Quantity" });
}
if(!cartId){
    let cart = await cartModel.findOne({userId:userId})
    if(cart){
        return res.status(400).send({status:false,message:`${cart.userId} with this userId cart is already present ${cart._id} this is your cart id `})
    }
    if (!cart) {
        const addToCart = {
            userId:userId,
            items: {
                productId: productId,
                quantity: quantity
            },
            totalPrice: findProduct.price * quantity,
            totalItems: 1
        }

        const newCart = await cartModel.create(addToCart)
        return res.status(201).send({ status: true, message: "cart created and product added to cart successfully", data: newCart })
    }
}

if(cartId){
if(!validate.isValidObjectId(cartId)){
    return res.status(400).send({ status: false, message: "CartId is Not Valid" });
}

const correctCartId =await cartModel.findOne({userId:userId})
if(correctCartId)
if(correctCartId._id != cartId){
    return res.status(400).send({ status: false, message: "CartId is Not match" });
}


const findCart =await cartModel.findOne({_id:cartId})
if(!findCart){
    return res.status(404).send({ status: false, message: "Cart not exist with this id so create cart first" });
}


if(findCart.userId !=userId){
    return res.status(401).send({status:false,message:"This cart does not belongs to this user"})} 
    
if (findCart) {

    //to increase quantity
    for (let i = 0; i < findCart.items.length; i++) {

        if (`${findCart.items[i].productId}` == findProduct._id) {
            findCart.items[i].quantity = findCart.items[i].quantity + quantity
            findCart.totalPrice = (findProduct.price * quantity) + findCart.totalPrice
            findCart.totalItems = findCart.items.length
            findCart.save()
            return res.status(200).send({ status: true, message: `Quantity of ${findCart.items[i].productId} increases`, data: findCart })
        }
    }

    //add new item in cart
    findCart.items[(findCart.items.length)] = { productId: productId, quantity: quantity }
    findCart.totalPrice = (findProduct.price * quantity) + findCart.totalPrice
    findCart.totalItems = findCart.items.length
    findCart.save()
    return res.status(200).send({ status: true, message: `New product ${findProduct._id} added in cart`, data: findCart })
}
}
}
catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }  
}



// update cart
const updateCart = async function (req, res) {
  try {
        let userId = req.params.userId
        let data = req.body
        const { cartId, productId,removeProduct } = data
        if (!validate.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid user Id, please provide valid user Id" })
        }
        const checkuser = await userModel.findById({ _id: userId })
        if (!checkuser) {
            return res.status(400).send({ status: false, msg: "This user is not exist" })
        }

        let searchCart = await cartModel.findOne({ userId: userId })
        if (!searchCart) {
            return res.status(404).send({ status: false, msg: "User does not have any cart" })
        }

        if (validate.isValidBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide data inside body to update" })
        }

        if (!cartId)
            return res.status(400).send({ status: false, msg: "cartId is required" })

        if (!validate.isValidObjectId(cartId))
            return res.status(400).send({ status: false, msg: "Invalid Cart Id, please provide valid cart Id" })

        const checkCart = await cartModel.findById({ _id: cartId })
       let checkProductId = await cartModel.findOne({ _id: checkCart._id, 'items.productId': {$in: [data.productId]} });
       if(!checkProductId) return res.status(404).send({ status: false, message: `No product found in the cart with this '${data.productId}' productId` });
   
         if(checkCart.userId !=userId){
            return res.status(401).send({status:false,message:"This cart does not belongs to this user"})}  
        if (!checkCart)
            return res.status(404).send({ status: false, msg: "this cart Id does not exist" })

        if (!productId) {
            return res.status(400).send({ status: false, msg: "Product Id is required" })
        }

        if (!validate.isValidObjectId(productId))
            return res.status(400).send({ status: false, msg: "Invalid Product Id, please provide valid Product Id" })
       
        let { items } = searchCart

        const checkProduct = await productModel.findById({ _id: productId })
        if (!checkProduct)
            return res.status(404).send({ status: false, msg: "this Product Id does not exist" })

            if(validate.isValid(removeProduct)){
              return res.status(400).send({status:false,msg:"removeproduct is required"})
            }
            if ((isNaN(Number(removeProduct)))) {
              return res.status(400).send({ status: false, message: 'removeProduct should be a valid number' })
          }
            if (!(removeProduct == 0 ||  removeProduct == 1)) {
             return res.status(400).send({ status: false, message: 'removeProduct should be 0 or 1' })
         }
         data.userId=userId
        let getPrice = checkProduct.price

        for (let i = 0; i < items.length; i++) {
            if (items[i].productId == productId) {
                let totalProductprice = items[i].quantity * getPrice
            

                if (removeProduct === 0) {
                    const updateProductItem = await cartModel.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: productId } }, totalPrice: searchCart.totalPrice - totalProductprice, totalItems: searchCart.totalItems - 1 }, { new: true })
                
                    return res.status(200).send({ status: true, msg: 'Successfully removed product', data: updateProductItem })

                }
                if (removeProduct === 1) {
                    if (items[i].quantity === 1 && removeProduct === 1) {
                        const removedProduct = await cartModel.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: productId } }, totalPrice: searchCart.totalPrice - totalProductprice, totalItems: searchCart.totalItems - 1 }, { new: true })
                        return res.status(200).send({ status: true, msg: 'Successfully removed product and cart is empty', data: removedProduct })
                    }
                    items[i].quantity = items[i].quantity - 1
                    const updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: items, totalPrice: searchCart.totalPrice - getPrice }, { new: true });
                    return res.status(200).send({ status: true, msg: 'Quantity of product decreases by 1', data: updatedCart })
                }
            }


        }
    }
 catch (err) {
        return res.status(500).send({ status: false, msg: err })
    }
 } 


//Get CartByID
const getCart = async function (req, res) {
    try {
        const userId = req.params.userId
      
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }
        const findUser= await userModel.findById({_id:userId})
            if(!findUser){
         return res.status(404).send({ status: false, message: "user not exist in DB" })
            }
        const getData = await cartModel.findOne({ userId: userId }).select({ _id: 0 })
        if (!getData) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }
        return res.status(200).send({ status: true, message: "Card Details", data: getData })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//Delete Cart
const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId
        
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }
        const findUser= await userModel.findById({_id:userId})
        if(!findUser){
     return res.status(404).send({ status: false, message: "user not exist in DB" })
        }
        const cartData = await cartModel.findOne({ userId: userId })
        if (!cartData) {
            return res.status(404).send({ status: false, message: "cart not found" })
        }
       
        let cart = { totalItems: 0, totalPrice: 0, items: [] }
        const deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, cart, { new: true })
        res.status(204).send({ status: true, message: "cart deleted successfully", data: deleteCart })
     }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}
module.exports = {createCart,getCart,deleteCart,updateCart}
