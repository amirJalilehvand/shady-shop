const {validationResult} = require('express-validator/check')

const Product = require('../models/product');

exports.postAddProduct = (req , res ,next ) => {
    const prodTitle = req.body.title;
    const prodImageUrl = req.body.imageUrl;
    const prodPrice = req.body.price;
    const prodDesc = req.body.description;

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product' , {
            pageTitle:'افزودن محصول',
            editing:false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                title: prodTitle,
                imageUrl: prodImageUrl,
                price: prodPrice,
                description: prodDesc
            },
            validationError: errors.array()
        })
    }
    
    const product = new Product({
        title: prodTitle,
        imageUrl: prodImageUrl,
        price: prodPrice,
        description: prodDesc,
        userId: req.user
    });

    return product.save()
        .then(result => {
            console.log('the product is created');
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        });
    
}

exports.getAddProduct = (req , res , next) => {
    res.render('admin/edit-product' , {
        pageTitle:'افزودن محصول',
        editing:false,
        hasError: false,
        errorMessage: null,
        oldInput: {
            title: '',
            imageUrl: '',
            price: '',
            description: ''
        },
        validationError: []
    });
}

exports.getAdminProducts = (req , res , next) => {
    Product.find()
        .then(products =>{
            res.render('admin/products' , {products: products , pageTitle:'صفحه ادمین'});  
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error)
    });
}

exports.getEditProduct = (req , res , next) => {
    const prodId = req.params.productId;
    const editing = req.query.edit === 'true'? true : false;
    Product.findById(prodId)
        .then(product => {
        if(!product){
            return res.redirect('/admin/products');
        }else{
            res.render('admin/edit-product' , {
                pageTitle:'ویرایش محصول',
                editing:editing,
                hasError: false,
                errorMessage: null,
                oldInput: {
                    title: product.title,
                    imageUrl: product.imageUrl,
                    price: product.price,
                    description: product.description,
                    _id : prodId
                },
                validationError: []
            });
        }
    })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        });
}

exports.postEditProduct = (req , res ,next ) => {
    const prodId = req.body.productId;
    const prodTitle = req.body.title;
    const prodImageUrl = req.body.imageUrl;
    const prodPrice = Number(req.body.price);
    const prodDesc = req.body.description;
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product' ,{
            pageTitle:'ویرایش محصول',
            hasError: true,
            editing:true ,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                title: prodTitle,
                imageUrl: prodImageUrl,
                price: prodPrice,
                description: prodDesc,
                _id: prodId
            },
            validationError: errors.array()
        })
    }

    Product.findById(prodId)
        .then(product => {
            product.title = prodTitle;
            product.imageUrl = prodImageUrl;
            product.price = prodPrice;
            product.description = prodDesc;
            return product.save();
        })
            .then(result => {
                console.log('the product has been updated');
                res.redirect('/admin/products')
            })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        });
}

exports.postDeleteProduct = (req , res ,next ) => {
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId)
        .then(() => {
            console.log('the product has been removed');
            res.redirect('/admin/products');
        })
        .catch(err =>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        });
}