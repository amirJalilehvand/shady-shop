const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name : {
        type: String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    cart : {
        items : [{
            productId: {type:Schema.Types.ObjectId , ref: 'Product' , required:true} , 
            quantity: {type: Number , required: true}
        }]
    }
})

userSchema.methods.addToCart = function(product){
    const productIndex = this.cart.items.findIndex(p => {
        return p.productId.toString() === product._id.toString();
    })

    const cartItems = [...this.cart.items];
    let newQuanatity = 1;

    if(productIndex >= 0){
        newQuanatity = this.cart.items[productIndex].quantity + 1;
        cartItems[productIndex].quantity = newQuanatity;
    }else{
        cartItems.push({productId:product._id , quantity: newQuanatity});
    }
    
    const updatedCart = {items : cartItems}
    this.cart = updatedCart;
    this.save();
}

userSchema.methods.deleteFromCart = function(prodId){
    const cartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== prodId.toString();
    })
    this.cart = {items : cartItems}
    return this.save();
}

userSchema.methods.reduceFromCart = function(prodId) {
    const productIndex = this.cart.items.findIndex(item => {
        return item.productId.toString() === prodId.toString();
    })
    this.cart.items[productIndex].quantity -= 1;
    return this.save();
}

userSchema.methods.clearCart = function(){
    this.cart = { items : [] }
    return this.save();
}

module.exports = mongoose.model('User' , userSchema);