exports.get404 = (req , res , next) => {
    res.status(404).render('404/404' , {pageTitle: 'صفحه ای یافت نشد' , isAuthenticated: req.session.isLoggedIn})
}


exports.get500 = (req , res , next) => {
    res.status(500).render('500/500' , {pageTitle: 'متاسفانه مشکلی پیش آمده است' , isAuthenticated: req.session.isLoggedIn})
}
