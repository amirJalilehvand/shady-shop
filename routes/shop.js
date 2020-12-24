const express = require('express');
const path = require('path')
const isAuth = require('../middleware/isAuth')

const shopController = require('../controllers/shop')

const router = express.Router();

router.get('/products' , shopController.getProducts);
router.get('/products/:productId' , shopController.getProduct);
router.get('/cart' , isAuth, shopController.getCart);
router.get('/' , shopController.getIndex);
router.get('/orders' , isAuth, shopController.getOrders)

router.post('/add-to-cart' , isAuth, shopController.postCart)
router.post('/delete-from-cart' , isAuth, shopController.postDeleteFromCart)
router.post('/reduce-from-cart' , isAuth, shopController.postReduceCart);
router.post('/create-order' , isAuth, shopController.postOrder)

module.exports = router;