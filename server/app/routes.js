var express = require('express');

var assignments = require('./assignments')
var users = require('./users')

module.exports = function(app, passport) {

    // =====================================
    // LOGIN ===============================
    // =====================================

    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    // process the login form
    app.post('/login', passport.authenticate('login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // HOME PAGE (once logged in) ==========
    // =====================================

    app.get('/', isLoggedIn, function(req, res) {
        res.redirect('/assignments');
    });

    // =====================================
    // Docs ================================
    // =====================================

    app.get('/docs', isLoggedIn, function (req, res) {
        res.render('docs.ejs', {
            user: req.user,
        });
    });

    app.get('/docs/:path', isLoggedIn, function (req, res) {
        res.download('docs/' + req.params.path);
    });


    // =====================================
    // All assignments =====================
    // =====================================

    app.get('/assignments', isLoggedIn, assignments.renderAssignmentsPage);
 
    // =====================================
    // Details of specific assignment ======
    // =====================================
    
    app.get('/assignment', isLoggedIn, assignments.renderAssignmentPage);

    // =====================================
    // Serve assignment file          ======
    // =====================================    

    app.get('/assignment/problems/:assignmentName', isLoggedIn, assignments.serveProblems);

    // =====================================
    // Serve assignment solution      ======
    // =====================================    

    app.get('/assignment/solutions/:assignmentName', isLoggedIn, assignments.serveSolutions);


    // =====================================
    // Assignment upload              ======
    // ===================================== 

    app.post('/assignment/upload/:assignmentName', isLoggedIn, assignments.uploadSubmission);

    // =====================================
    // Manage users ========================
    // =====================================

    app.get('/manageUsers', isLoggedIn, isAdmin, users.manageUsers);

    // =====================================
    // Manage services =====================
    // =====================================

    app.get('/manageAssignments', isLoggedIn, isAdmin, assignments.manageAssignments);

    // =====================================
    // Account Settings ====================
    // =====================================

    app.get('/accountSettings', isLoggedIn, function(req, res) {
        res.render('account_setting.ejs', {
            user: req.user,
            editUserError: req.flash('editUserError'),
            editUserSuccess: req.flash('editUserSuccess')
        });
    });

    // =====================================
    // Add/Edit/Remove user ================
    // =====================================

    app.post('/addUser', isLoggedIn, isAdmin, users.addUser);

    app.post('/editUser', isLoggedIn, isAdmin, function(req, res) {
        users.editUser(req, res, '/manageUsers')
    });

    app.post('/changeProfile', isLoggedIn, isAdmin, function(req, res) {
        users.editUser(req, res, '/accountSettings')
    });

    app.post('/removeUser', isLoggedIn, isAdmin, users.removeUser);

    // =====================================
    // Add/Edit/Remove service =============
    // =====================================

    app.post('/addAssignment', isLoggedIn, isAdmin, assignments.addAssignment);

    app.post('/editAssignment', isLoggedIn, isAdmin, assignments.editAssignment);

    app.post('/removeAssignment', isLoggedIn, isAdmin, assignments.removeAssignment);

    // =====================================
    // LOGOUT ==============================
    // =====================================

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

// route middleware to make sure a user is admin
function isAdmin(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.user.isAdmin || req.body.username == req.user.username){
        return next();
    };

    // if they aren't redirect them to the home page
    res.redirect('/forbidden');
}