var express = require('express');

// load up the user model
var Users = require('./models/user');
var Assignments = require('./models/assignment');

var helpers = require('./helpers');


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
    // All assignments ======================
    // =====================================

    app.get('/assignments', isLoggedIn, function(req, res) {
        Assignments.find({}, function(err, assignments) {
            for(i=0; i<assignments.length; i++){
                date = new Date(assignments[i].endTime);
                assignments[i].endTime = date.toLocalString();
                assignments[i].isSubmitted = req.user._id in assignments[i].whoSubmitted;
                assignments[i].isActive = (assignments[i].endTime - new Date() > 0);
                assignments[i].showToStudents = (new Date() - assignments[i].startTime > 0);
            }
            res.render('assignments.ejs', {
                user: req.user,
                assignments: assignments
            });
        });
    });
    // =====================================
    // Details of specific assignment ======
    // =====================================
    
    app.get('/assignment/:assignmentId', isLoggedIn, function(req, res) {
        Assignments.findOne({'_id': req.params.assignmentId}, function(err, assignment) {
            date = new Date(assignment.endTime);
            assignment.endTime = date.toLocalString();
            assignment.isSubmitted = req.user._id in assignment.whoSubmitted;
            assignment.isActive = (assignment.endTime - new Date() > 0);
            res.render('reception_desk.ejs', {
                user: req.user,
                assignment: assignment
            });
        });
    });


    // =====================================
    // Manage users ========================
    // =====================================

    app.get('/manageUsers', isLoggedIn, isAdmin, function(req, res) {
        Users.find({}, function(err, users) {
            var usernameList = [];
            for (var i = 0; i < users.length; i++) {
                usernameList.push(users[i].username);
            }
            res.render('manage_users.ejs', {
                user: req.user,
                usernameList: usernameList,
                addUserError: req.flash('addUserError'),
                editUserError: req.flash('editUserError'),
                removeUserError: req.flash('removeUserError'),
                addUserSuccess: req.flash('addUserSuccess'),
                editUserSuccess: req.flash('editUserSuccess'),
                removeUserSuccess: req.flash('removeUserSuccess'),
            });
        });
    });

    // =====================================
    // Manage services =====================
    // =====================================

    app.get('/manageAssignments', isLoggedIn, isAdmin, function(req, res) {
        Assignments.find({}, function(err, assignments) {
            res.render('manage_assignments.ejs', {
                user: req.user,
                assignments: assignments,
                addAssignmentError: req.flash('addAssignmentError'),
                editAssignmentError: req.flash('editAssignmentError'),
                removeAssignmentError: req.flash('removeAssignmentError'),
                addAssignmentSuccess: req.flash('addAssignmentSuccess'),
                editAssignmentSuccess: req.flash('editAssignmentSuccess'),
                removeAssignmentSuccess: req.flash('removeAssignmentSuccess'),
            });
        });
    });

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

    app.post('/addUser', isLoggedIn, isAdmin, helpers.addUser);

    app.post('/editUser', isLoggedIn, isAdmin, function(req, res) {
        helpers.editUser(req, res, '/manageUsers')
    });

    app.post('/changeProfile', isLoggedIn, isAdmin, function(req, res) {
        helpers.editUser(req, res, '/accountSettings')
    });

    app.post('/removeUser', isLoggedIn, isAdmin, helpers.removeUser);

    // =====================================
    // Add/Edit/Remove service =============
    // =====================================

    app.post('/addAssignment', isLoggedIn, isAdmin, helpers.addAssignment);

    app.post('/editAssignment', isLoggedIn, isAdmin, helpers.editAssignment);

    app.post('/removeAssignment', isLoggedIn, isAdmin, helpers.removeAssignment);

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
    if (req.user.isAdmin || req.body.username == req.user.username);
    return next();

    // if they aren't redirect them to the home page
    res.redirect('/forbidden');
}
