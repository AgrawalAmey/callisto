var Users = require('./models/user');


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
    // Manage Users ============================================================
    // =========================================================================

    manageUsers: function (req, res) {
        // asynchronous
        process.nextTick(function () {
            Users.find({}, function (err, users) {
                if(err)
                    res.render('/')
                    
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
                })
            })
        })
    },

    // =========================================================================
    // Add User ================================================================
    // =========================================================================
    
    addUser: function(req, res) {
            
        // asynchronous
        process.nextTick(function() {

            // check to see if password is not empty
            if (req.body.password == undefined || req.body.password == '') {
                req.flash('addUserError', 'Please enter password.');
                res.redirect('/manageUsers');
                return;
            }

    
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
    
            // check to see if password is not empty
            if (req.body.password == undefined || req.body.password == '') {
                req.flash('addUserError', 'Please enter password.');
                res.redirect('/manageUsers');
                return;
            }
            
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
    }
}
