const express = require('express');
const { check , body } = require('express-validator/check')

const router = express.Router();

const authController = require('../controllers/auth');
const User = require('../models/user')

router.get('/login' , authController.getLogin);

router.post('/login' , 
                [
                    body('userId')
                        .trim()
                        .custom((value) => {
                            return User.findOne({$or:[{name:value},{email: value}]})
                                .then(userDoc => {
                                    if(!userDoc){
                                        return Promise.reject('نام کاربری/ایمیل یا رمز عبور اشتباه است');
                                    }
                                })
                        })
                ] 
                , 
                authController.postLogin);


router.get('/signup' , authController.getSignUp);

router.post('/signup', 
            [
                check('username')
                    .isString()
                    .isLength({min: 5})
                    .withMessage('نام کاربری باید حداقل 5 کاراکتر باشد')
                    .trim()
                    .custom(value => {
                        return User.findOne({name: value})
                                .then(userDoc => {
                                    if(userDoc){
                                        return Promise.reject('این نام کاربری قبلا گرفته شده است')
                                    }
                                })
                    })
                    ,
                    check('email')
                        .isEmail()
                        .withMessage('لطفا یک ایمیل معتبر وارد کنید')
                        .custom(value => {
                            return User.findOne({email: value})
                                    .then(userDoc => {
                                        if(userDoc){
                                            return Promise.reject('این ایمیل قبلا وارد شده است')
                                        }
                                    })
                        })
                        .normalizeEmail()
                        ,
                        body(
                            'password' , 
                            'رمز عبور شما باید حداقل شامل 6 کاراکتر و فقط اعداد و حروف باشند')
                            .isLength({min: 6})
                            .isAlphanumeric()
                            .trim()
                             ,
                        body('confirmPassword')
                        .trim()
                        .custom((value , {req}) => {
                            if(value !== req.body.password){
                                throw new Error('رمز عبور را به صورت یکسان وارد کنید')
                            }
                            return true;
                        })
            ] 
            ,
             authController.postSignUp); 

router.post('/logout' , authController.postLogout)

module.exports = router;