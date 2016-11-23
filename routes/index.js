var express = require('express');
var router = express.Router();
var passport = require('passport');

require('../config/passport')(passport); // pass passport for configuration
var config =require('../config/config');
header = [];
header["sitetitle"] = "City Guide";
header["baseurl"] = config.baseURL;

user = [];
user['name'] = "John Snow";
user['avatar'] = "image link";
user['status'] = false;
user['loginStatus'] = false;




/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.get('host'));
    if(typeof res.user !== "undefined" ){
        console.log("define user");
    }else{
        console.log("not define user");
    }
    header["title"] = 'Home';
    res.render('index', { header: header,user: user,title: 'Local guide' });
});
/* GET about page. */
router.get('/about', function(req, res, next) {
    header["title"] = 'About Us';
    res.render('about', { header: header,user: user,title: 'About us'  });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
    header["title"] = 'About Us';
    res.render('about', { header: header,user: user,title: 'About us'  });
});
/*
@Todo: Shoaib
 */
// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
/*
 GET signup page.
 */
router.get('/signup', function(req, res, next) {
    header["title"] = 'Sign up';
    res.render('signup', { header: header,user: user,title: 'Sign up'  });
});
// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure  section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));
// process the login form
router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));
/*
 GET login with facebook request.
 */
router.get('/loginfacebook', passport.authenticate('facebook', { scope : 'email' }));
// handle the callback after facebook has authenticated the user
router.get('/loginfacebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/',
        failureRedirect : '/'
    }), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
/*
@todo: areeb
this is your page for chat and url is  http://localhost:3000/chat

 */

router.get('/chat', function(req, res, next) {
    header["title"] = 'Chat with people around you';
    res.render('chat', {header: header,user: user,title: 'Chat arround you'  });
});

/*
@todo: Waqar
this is your page for location share and url is  http://localhost:3000/sharelocation
The idea is on this page user will be shown a email form
where he/she can enter the email of person
whom he/she can share his/her location

 */
router.get('/sharelocation', function(req, res, next) {
    header["title"] = 'Share location with your buddy';
    res.render('sharelocation', { header: header,user: user,title: 'Sh'  });
});

module.exports = router;
