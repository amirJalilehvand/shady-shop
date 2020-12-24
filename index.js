const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const User = require('./models/user')

const MONGO_URI = 'mongodb+srv://<mongodb_username>:<your password>@cluster0.louoq.mongodb.net/<db_name>?retryWrites=true&w=majority';

const app = express();

const store = new mongoDbStore({
    uri: MONGO_URI,
    collection: 'sessions'
})

const csrfProtection = csrf();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine' , 'ejs');
app.set('views' , 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRouter = require('./routes/auth')
const errorController = require('./controllers/error');

app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}))

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) =>{
    if(!req.session.user){
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        if(!user){
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        next(new Error(err));
      });
  });


app.use((req , res , next)=> {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken()
    next();
})

app.use('/admin' ,adminRoutes);
app.use(shopRoutes);
app.use(authRouter);

app.use(errorController.get404);
app.use(errorController.get500);

app.use((error , req , res , next) => {
  res.status(500).render('500/500' , {
    pageTitle: 'متاسفانه مشکلی پیش آمده است' , 
    isAuthenticated:(req.session) ? req.session.isLoggedIn : false
  })
})



mongoose.connect(MONGO_URI)
        .then(result => {
            console.log('connected');
            app.listen(3000)    
        })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error)
  });