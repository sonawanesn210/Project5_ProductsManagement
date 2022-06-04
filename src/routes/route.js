const express = require('express');
const router = express.Router();
const {createUser,loginUser,getUser,updateUserById}=require('../controllers/userController')
const{ createProduct,deleteProduct,updateProduct,getProduct,getProductById}= require('../controllers/productController')
const{ authentication ,authorization}= require('../middlewares/auth');
const { createCart, getCart, deleteCart,updateCart } = require('../controllers/cartController');
const { createOrder,updateOrder } = require('../controllers/orderController');



//FEATURE I - User Apis

router.post('/register',createUser)

router.post('/login',loginUser)

router.get('/user/:userId/profile',authentication,authorization,getUser)

router.put('/user/:userId/profile',authentication,authorization,updateUserById)


//FEATURE II - Product APIs

router.post('/products',createProduct)

router.get('/products',getProduct)

router.get('/products/:productId',getProductById)

router.put('/products/:productId',updateProduct)

router.delete('/products/:productId',deleteProduct)

//FEATURE III - Cart

router.post('/users/:userId/cart',authentication,authorization, createCart)

router.put('/users/:userId/cart',authentication,authorization, updateCart)

router.get('/users/:userId/cart',authentication,authorization,getCart)

router.delete('/users/:userId/cart',authentication,authorization,deleteCart)

//FEATURE IV - Order

router.post('/users/:userId/orders',authentication,authorization, createOrder)

router.put('/users/:userId/orders', authentication,authorization,updateOrder)



// if incorrect url

router.post("*", (req,res) =>{

    return res.status(404).send({ message:"Page Not Found"})
})

router.post("*", (req,res) =>{
     return res.status(404).send({ message:"Page Not Found"})
})


router.get("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})

router.put("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})

router.get("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})

router.put("*", (req,res) =>{

    return res.status(404).send({ message:"Page Not Found"})
})
 
router.delete("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})

module.exports = router;
