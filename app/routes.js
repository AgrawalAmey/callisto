var express = require('express');
var multer  =   require('multer');
var path = require('path');
var formidable = require('formidable');

// load up the user model
var Users = require('./models/user');
var Assignments = require('./models/assignment');

var helpers = require('./helpers');

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'assignments/' + req.params.assignmentName + '/submissions');
  },
  filename: function (req, file, callback) {
    callback(null, req.user.username + '.zip');
  }
});

var upload = multer({
        storage : storage,
        fileFilter: function(req, file, cb) {
            if (path.extname(file.originalname) !== '.zip') {
                return cb(new Error('FileTypeNotSupported'));
            } 
            cb(null, true);
    }}).single('file');


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
        if (!req.user.isAdmin) {
            res.render('docs.ejs', {
                user: req.user,
            });
        } else {
            res.redirect('/assignments');
        }
    });

    app.get('/docs/:path', isLoggedIn, function (req, res) {
        console.log(req, req.params.path);
        res.download('docs/' + req.params.path);
    });


    // =====================================
    // All assignments =====================
    // =====================================

    app.get('/assignments', isLoggedIn, function(req, res) {
        Assignments.find({}, function(err, assignments) {
            for(i=0; i<assignments.length; i++){
                startDate = new Date(assignments[i].startTime);
                endDate = new Date(assignments[i].endTime);
                assignments[i].isSubmitted = req.user._id in assignments[i].whoSubmitted;
                assignments[i].isActive = (endDate - new Date() > 0 && startDate - new Date() < 0);
                assignments[i].showToStudents = (new Date() - startDate > 0);
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
    
    app.get('/assignment', isLoggedIn, function(req, res) {
        Assignments.findOne({'name': req.query.name}, function(err, assignment) {
            startDate = new Date(assignment.startTime);
            endDate = new Date(assignment.endTime);
            assignment.isSubmitted = req.user._id in assignment.whoSubmitted;
            assignment.isActive = (endDate - new Date() > 0 && startDate - new Date() < 0);
            assignment.showToStudents = (new Date() - startDate > 0);
            if(assignment.showToStudents || req.user.isAdmin){
                res.render('assignment.ejs', {
                    user: req.user,
                    assignment: assignment,
                    uploadAssignmentError: req.flash('uploadAssignmentError'),
                    uploadAssignmentSuccess: req.flash('uploadAssignmentSuccess'),
                });
            } else {
                res.redirect('/assignments');
            }
        });
    });

    // =====================================
    // Serve assignment file          ======
    // =====================================    

    app.get('/assignment/release/:assignmentName', isLoggedIn, function(req, res) {
        Assignments.findOne({'name': req.params.assignmentName}, function(err, assignment) {
            startDate = new Date(assignment.startTime);
            endDate = new Date(assignment.endTime);
            assignment.isActive = (endDate - new Date() > 0 && startDate - new Date() < 0);
            assignment.showToStudents = (new Date() - startDate > 0);
            if(assignment.showToStudents || req.user.isAdmin){
                res.download('assignments/' + assignment.name + '/release.zip');
            } else {
                res.redirect('/assignments');
            }
        });
    });

    // =====================================
    // Serve assignment solution      ======
    // =====================================    

    app.get('/assignment/solutions/:assignmentName', isLoggedIn, function(req, res) {
        Assignments.findOne({'name': req.params.assignmentName}, function(err, assignment) {
            startDate = new Date(assignment.startTime);
            endDate = new Date(assignment.endTime);
            assignment.isActive = (endDate - new Date() > 0 && startDate - new Date() < 0);
            assignment.showToStudents = (new Date() - startDate > 0);
            if((assignment.showToStudents && assignment.solutionsAvailable) || req.user.isAdmin){
                res.download('assignments/' + assignment.name + '/solutions.zip');
            } else {
                res.redirect('/assignments');
            }
        });
    });

    // =====================================
    // Serve assignment feedback      ======
    // =====================================    

    app.get('/assignment/feedback/:assignmentName', isLoggedIn, function(req, res) {
        Assignments.findOne({'name': req.params.assignmentName}, function(err, assignment) {
            startDate = new Date(assignment.startTime);
            endDate = new Date(assignment.endTime);
            assignment.isActive = (endDate - new Date() > 0 && startDate - new Date() < 0);
            assignment.showToStudents = (new Date() - startDate > 0);
            if((assignment.showToStudents && assignment.feedbackAvailable) || req.user.isAdmin){
                res.download('assignments/' + assignment.name + '/feedback/' + req.user.username + '.zip');
            } else {
                res.redirect('/assignments');
            }
        });
    });

    // =====================================
    // Assignment upload              ======
    // ===================================== 

    app.post('/assignment/upload/:assignmentName', isLoggedIn, function(req, res) {
        Assignments.findOne({'name': req.params.assignmentName}, function(err, assignment) {
            startDate = new Date(assignment.startTime);
            endDate = new Date(assignment.endTime);
            assignment.isActive = (endDate - new Date() > 0 && startDate - new Date() < 0);
            if(assignment.isActive || req.user.isAdmin){
                upload(req, res, function(err) {
                    if(err) {
                        if(err.message== 'FileTypeNotSupported'){
                            req.flash('uploadAssignmentError', 'Only zip files are supported.');
                        } else {
                            req.flash('uploadAssignmentError', 'Oops! Something went wrong.');                            
                        }
                        res.redirect('/assignment?name=' + req.params.assignmentName);
                    } else {
                        req.flash('uploadAssignmentSuccess', 'Assignment submitted successfully.');
                        res.redirect('/assignment?name=' + req.params.assignmentName);
                    }
                }); 
            } else {
                res.redirect('/assignment?name=' + req.params.assignmentName);
            }
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
    if (req.user.isAdmin || req.body.username == req.user.username){
        return next();
    };

    // if they aren't redirect them to the home page
    res.redirect('/forbidden');
}

function hasFile(req, res, next){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(files.file.name == ''){
            req.flash('uploadAssignmentError', 'No file selected.');
            res.redirect('/assignment?name=' + req.params.assignmentName); 
            return;               
        } else { 
            return next();
        }
    });
}