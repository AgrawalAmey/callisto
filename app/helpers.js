var Users = require('./models/user');
var Assignments = require('./models/assignment'); 

module.exports = {

    // =========================================================================
    // Login ================================================================
    // =========================================================================
    
    processLogin: function(req, username, password, done) {
        // asynchronous
        process.nextTick(function() {
            Users.findOne({ 'username' :  username }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(null, false, req.flash('loginMessage', 'Oops! Something went wrong.'));
    
                // if no user is found, return the message
                if (!user){  
                    return done(null, false, req.flash('loginMessage', 'Incorrect username.'));        
                }
                if (!user.validPassword(password)){
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                }
    
                // all is well, return user
                else
                    return done(null, user);
            });
        });
    },
    
    // =========================================================================
    // Add User ================================================================
    // =========================================================================
    
    addUser: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {
    
            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            Users.findOne({'username': req.body.username}, function(err, existingUser) {
    
                // if there are any errors, return the error
                if (err){
                    req.flash('addUserError', 'Oops! Something went wrong.');
                    res.redirect('/manageUsers');
                    return;    
                }
    
                // check to see if there's already a user with that email
                if (existingUser) {
                    req.flash('addUserError', 'That username is already taken.');
                    res.redirect('/manageUsers');
                    return;    
                }
    
                // create the user
                var newUser = new Users();
    
                newUser.username = req.body.username;
                newUser.password = newUser.generateHash(req.body.password);
                newUser.name = req.body.name;
                newUser.isAdmin = false;
    
                newUser.save(function(err) {
                    if (err) {
                        req.flash('addUserError', 'Oops! Something went wrong.');
                        res.redirect('/manageUsers');
                        return;   
                    }
                    req.flash('addUserSuccess', 'User added successfully.');
                    res.redirect('/manageUsers');
                    return; 
                });
            });
        });
    },
    
    // =========================================================================
    // Edit User ===============================================================
    // =========================================================================
    
    editUser: function(req, res, successRedirect) {
        // asynchronous
        process.nextTick(function() {
    
            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            Users.findOne({'username': req.body.username}, function(err, existingUser) {
    
                // if there are any errors, return the error
                if (err) {
                    req.flash('editUserError', 'Oops! Something went wrong.');
                    res.redirect(successRedirect);
                    return;    
                }
    
                existingUser.password = existingUser.generateHash(req.body.password);
                existingUser.name = req.body.name;
                    
                existingUser.save(function(err, editedUser) {
                    if (err) {
                        req.flash('editUserError', 'Oops! Something went wrong.');
                        res.redirect(successRedirect);
                        return;    
                    }
                    req.flash('editUserSuccess', 'Information edited successfully.');
                    res.redirect(successRedirect);
                    return;    
                });
            });
        });
    },

    // =========================================================================
    // Remove user =============================================================
    // ========================================================================= 
    
    removeUser: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {
    
            if(req.body.username == 'admin') {
                req.flash('removeUserError', 'Cannot remove admin.');
                res.redirect('/manageUsers');
                return;                  
            }
            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            Users.remove({'username': req.body.username}, function(err) {
    
                // if there are any errors, return the error
                if (err){
                    req.flash('removeUserError', 'Oops! Something went wrong.');
                    res.redirect('/manageUsers');
                    return;                
                }
                req.flash('removeUserSuccess', 'User removed successfully.');
                res.redirect('/manageUsers');
                return;
            });
        });
    },

    // =========================================================================
    // Add Assignment =============================================================
    // =========================================================================

    addAssignment: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {
    
            Assignments.findOne({'name': req.body.name}, function(err, existingAssignment) {
    
                // if there are any errors, return the error
                if (err){
                    req.flash('addAssignmentError', 'Oops! Something went wrong.');
                    res.redirect('/manageAssignments');
                    return;                
                }
    
                // check to see if there's already a assignment with that email
                if (existingAssignment) {
                    req.flash('addAssignmentError', 'That name is already taken.');
                    res.redirect('/manageAssignments');
                    return;
                }
    
                // create the user
                var newAssignment = new Assignments();
    
                newAssignment.name = req.body.name;
                newAssignment.startTime = req.body.startTime;
                newAssignment.endTime = req.body.endTime;
                newAssignment.solutionsAvailable = req.body.solutionsAvailable || false;
                newAssignment.feedbackAvailable = req.body.feedbackAvailable || false;
                newAssignment.acceptSubmission = req.body.acceptSubmission || false;
                
                newAssignment.save(function(err) {
                    if (err) {
                        req.flash('addAssignmentError', 'Oops! Something went wrong.');
                        res.redirect('/manageAssignments');
                        return;
                    }         
                    req.flash('addAssignmentSuccess', 'Assignment added successfully.');
                    res.redirect('/manageAssignments');
                    return;
                });
            });
        });
    },


    // =========================================================================
    // Edit Assignment ============================================================
    // =========================================================================

    editAssignment: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {
    
            Assignments.findOne({'name': req.body.oldName}, function(err, existingAssignment) {
    
                // if there are any errors, return the error
                if (err){
                    req.flash('editAssignmentError', 'Oops! Something went wrong.');
                    res.redirect('/manageAssignments');
                    return;                
                }
    
                existingAssignment.name = req.body.name;
                existingAssignment.startTime = req.body.startTime;
                existingAssignment.endTime = req.body.endTime;
                existingAssignment.solutionsAvailable = req.body.solutionsAvailable || false;
                existingAssignment.feedbackAvailable = req.body.feedbackAvailable || false;
                existingAssignment.acceptSubmission = req.body.acceptSubmission || false;

                existingAssignment.save(function(err) {
                    if (err) {
                        req.flash('editAssignmentError', 'Oops! Something went wrong.');
                        res.redirect('/manageAssignments');
                        return;
                    }         
                    req.flash('editAssignmentSuccess', 'Assignment edited successfully.');
                    res.redirect('/manageAssignments');
                    return;
                });
            });
        });
    },   
    
    // =========================================================================
    // Remove Assignment ==========================================================
    // ========================================================================= 
    
    removeAssignment: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {
    
            Assignments.remove({'name': req.body.name}, function(err) {
    
                // if there are any errors, return the error
                if (err){
                    req.flash('removeAssignmentError', 'Oops! Something went wrong.');
                    res.redirect('/manageAssignments');
                    return;                
                }
        
                req.flash('removeAssignmentSuccess', 'Assignment removed successfully.');
                res.redirect('/manageAssignments');
                return;
            });
        });
    }
}
