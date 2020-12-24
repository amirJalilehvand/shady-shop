const Product = require('../models/product');
const Order = require('../models/order');

exports.getOrders = (req , res , next) =>{
    Order.find({'user' : req.user._id})
        .then(orders => {
            res.render('shop/orders', {orders: orders , pageTitle:'سفارشات شما'});
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        });
}

exports.postOrder = (req , res , next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item =>{
                return {quantity: item.quantity , product:{...item.productId._doc}}
            })
            const order = new Order({
                user: req.user ,
                items : products
            })
            return order.save();
        })
            .then(order => {
                console.log('the order has been created by ' , req.user.name);
                return req.user.clearCart()
            })
                    .then(result => {
                        console.log(req.user.name , '\'s cart has been cleared');
                        res.redirect('/orders')
                })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        });
}

exports.getCart = (req , res , next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', {products: products , pageTitle:'سبد خرید'});
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        });
}

exports.postCart = (req , res , next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log('the product has been added to ', req.user.name , '\'s cart');
            res.redirect('/cart')
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        });
}

exports.postDeleteFromCart = (req , res , next) => {
  const prodId = req.body.productId;
  req.user.deleteFromCart(prodId)
    .then(() => {
        console.log('the product has been removed from ', req.user.name , '\'s cart');
        res.redirect('/cart');
    })

}

exports.postReduceCart = (req , res , next) => {
    const prodId = req.body.productId;
    req.user
        .reduceFromCart(prodId)
        .then(result => {
            console.log('reduced by 1');
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        }); 
  }

exports.getProducts = (req , res , next) => {
    Product.find()
        .then(products =>{
            res.render('shop/Product-list' , {products: products , pageTitle:'محصولات فروشگاه'});
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error)
    });

}


exports.getProduct =  (req, res, next) => {
    const prodId = req.params.productId;
    const editCart = req.query.cartEdition==='true'? true: false;
    if(!editCart){
        Product.findById(prodId)
            .then(prod =>{
                res.render('shop/product-detail' , {product: prod , pageTitle: 'درباره محصول' , editingCart:editCart})
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error)
        });
    }else{
        req.user
            .populate('cart.items.productId')
            .execPopulate()
            .then(user => {
                const product = user.cart.items.find(p => {
                    return p.productId._id.toString() === prodId.toString();
                })
                res.render('shop/product-detail' , {product: product , pageTitle: 'درباره ی این محصول' , editingCart:editCart})
            })
    } 
}

exports.getIndex = (req , res , next) => {
    res.render('shop/index' , {pageTitle:'شیدی شاپ'});
}