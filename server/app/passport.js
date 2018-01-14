// load all strategies 
var LocalStrategy    = require('passport-local').Strategy;
var request = require('request');


// load up the user model
var Users = require('./models/user');
var helpers = require('./helpers')

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        Users.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOGIN ===================================================================
    // =========================================================================
    passport.use('login', new LocalStrategy({
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    }, helpers.processLogin));
};

