// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;



// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport,databaseConnection) {
    // load up the user model
    var usermodule       		= require('../models/user')(databaseConnection);

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            var user={};
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(re.test(email)) {
                var result = usermodule.login(email,password);
                if(result === true )
                {
                    req.flash("successmessage", "Welcome ");
                    console.log('usercraeted');
                    user["email"]=email;
                    user["status"]=true;
                    user["name"]=email;
                    user["avatar"]="";
                    user["loginStatus"]=true;
                    return done(null, user);
                }else{
                    req.flash("errormessage", "Invalide email or password!");
                    user["msg"]="User not exists";
                    console.log('error ');
                }
            }else{
                req.flash("errormessage", "Invalide email!");
                user["msg"]="invalide email";
                console.log("out");
            }

            return done(null, false,user["msg"]);
        }));



    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function() {
                var user={};
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if(re.test(email)) {
                    var result = usermodule.createuser(email,password);
                    if(result === true )
                    {
                        req.flash("successmessage", "You have sign up successfully ");
                        //console.log('usercraeted');
                        user["email"]=email;
                        user["status"]=true;
                        user["name"]=email;
                        user["avatar"]="";
                        user["loginStatus"]=true;
                        return done(null, user);

                    }else{
                        req.flash("errormessage", "sign up ptocess failed");
                        //console.log('error ');
                    }
                }else{
                    req.flash("errormessage", "Invalide email!");
                    //console.log("out");
                }
                return done(null,false, user);

            });

        }));
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

            // pull in our app id and secret from our auth.js file
            clientID        : configAuth.facebookAuth.clientID,
            clientSecret    : configAuth.facebookAuth.clientSecret,
            callbackURL     : configAuth.facebookAuth.callbackURL,
            profileFields: ['id', 'emails', 'name'] //This

        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // database code here
                /*User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser            = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });*/
                var user={};


                var result = usermodule.fblogin(profile.emails[0].value,profile.id,profile.name.givenName);


                user["id"]=profile.id;
                user["token"]=token;
                user["email"]=profile.emails[0].value;
                user["status"]=true;
                user["name"]=profile.name.givenName + ' ' + profile.name.familyName;;
                user["avatar"]="";
                user["loginStatus"]=true;
                //req.flash("successmessage", "Welcome "+user["name"]);
                return done(null, user);
            });

        }));


    passport.use( new TwitterStrategy({
            consumerKey     : configAuth.twitterAuth.consumerKey,
            consumerSecret  : configAuth.twitterAuth.consumerSecret,
            callbackURL     : configAuth.twitterAuth.callbackURL
        },
        function(token, tokenSecret, profile, done) {
            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Twitter
            process.nextTick(function() {

                /*User.findOne({ 'twitter.id' : profile.id },
                    function(err, user) {
                        // if there is an error, stop everything and return that
                        // ie an error connecting to the database
                        if (err)
                            return done(err);

                        // if the user is found then log them in
                        if (user) {
                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser                 = new User();

                            // set all of the user data that we need
                            newUser.twitter.id          = profile.id;
                            newUser.twitter.token       = token;
                            newUser.twitter.username = profile.username;
                            newUser.twitter.displayName = profile.displayName;
                            newUser.twitter.lastStatus = profile._json.status.text;

                            // save our user into the database
                            newUser.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    }
                );*/
                var user={};
                user["id"]=profile.id;
                user["token"]=token;
                user["email"]=profile.username;
                user["status"]=true;
                user["name"]=profile.displayName;
                user["avatar"]="";
                user["loginStatus"]=true;
                user["lastStatus"]=profile._json.status.text;
                return done(null, user);
            });
        })
    );

};