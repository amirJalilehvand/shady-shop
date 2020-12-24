const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator/check')

const User = require('../models/user');

exports.getLogin = (req , res , next) => {
    
    res.render('auth/login' , {
        pageTitle : 'ورود به حساب کاربری',
        isAuthenticated: false,
        errorMessage: null,
        oldInput:{
            userId: '' ,
            password: ''
        },
        validationError: []
    })
}

exports.postLogin = (req , res , next) => {
    const userId = req.body.userId;
    const password = req.body.password;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render('auth/login' , {
            pageTitle : 'ورود به حساب کاربری',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput:{
                userId: userId ,
                password: password
            },
            validationError: errors.array()
        })
    }
        User.findOne({$or : [{name: userId} , {email: userId}]})
            .then(user => {
                return bcrypt.compare(password , user.password)    
                    .then(doMatch => {
                        if(!doMatch){
                            return res.status(422).render('auth/login' , {
                                pageTitle : 'ورود به حساب کاربری',
                                isAuthenticated: false,
                                errorMessage: 'نام کاربری/ایمیل یا رمز عبور اشتباه است',
                                oldInput:{
                                    userId: userId ,
                                    password: password
                                },
                                validationError: [{param: 'userId'}]
                            })
                    } 
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            if(err){
                                console.log(err);
                                }
                                res.redirect('/')
                            })
                        })
                })
                .catch(err =>{
                    console.log(err);
                    res.redirect('/login')
                })
}

exports.postLogout = (req , res , next) => {
    req.session.destroy(err => {
       if(err){
           console.log(err);
       }
        res.redirect('/login')
    })
}

exports.getSignUp = (req , res , next) => {
    res.render('auth/signup' , {
        pageTitle : 'حساب کاربری ایجاد کنید',
        isAuthenticated: false,
        errorMessage: null,
        oldInput : {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationError: []
    })
}

exports.postSignUp = (req , res , next) =>{
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render('auth/signup' , {
            pageTitle : 'حساب کاربری ایجاد کنید',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput : {
                username: username,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            }, 
            validationError: errors.array()
        })
    }
    
    bcrypt.hash(password , 12)
                .then(hashedPassword=>{
                    const user = new User({
                        name: username,
                        email:email,
                        password:hashedPassword
                    })
                    return user.save();
                })
                    .then(result => {
                        console.log('created user');
                        res.redirect('/login')
                    })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    next(error)
                });
            
}