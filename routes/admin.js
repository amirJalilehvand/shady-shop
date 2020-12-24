const express = require('express');

const isAuth = require('../middleware/isAuth')

const adminController = require('../controllers/admin');
const { check, body } = require('express-validator');

const router = express.Router();

router.get('/add-product' , isAuth, adminController.getAddProduct);
router.get('/edit-product/:productId' , isAuth, adminController.getEditProduct);
router.get('/products' , isAuth, adminController.getAdminProducts);

router.post('/add-product' , isAuth, 
                [
                    body('title' , 'عنوان باید حداقل 5 کاراکتر باشد')
                        .isString()
                        .isLength({min: 3})
                        .trim()
                    ,
                    body('imageUrl' , 'لطفا یک لینک معتبر وارد کنید')
                        .isURL()
                    ,
                    body('price')
                        .isFloat()
                    ,
                    body('description' , 'توضیحات باید حداقل 5 و حداکثر 420 کاراکتر باشد')
                        .isLength({min : 5})
                        .trim()
                ]
                , adminController.postAddProduct);

router.post('/edit-product' , isAuth,
[
    body('title' , 'عنوان باید حداقل 5 کاراکتر باشد')
        .isString()
        .isLength({min: 3})
        .trim()
    ,
    body('imageUrl' , 'لطفا یک لینک معتبر وارد کنید')
        .isURL()
    ,
    body('price')
        .isFloat()
        .withMessage('لطفا یک عدد وارد کنید')
    ,
    body('description' , 'توضیحات باید حداقل 5 و حداکثر 420 کاراکتر باشد')
        .trim()
        .isLength({min : 5})
]
,
 adminController.postEditProduct);

router.post('/delete-product' , isAuth, adminController.postDeleteProduct);

module.exports = router;