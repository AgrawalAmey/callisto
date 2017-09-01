var mongoose = require('mongoose');
var User       = require('./app/models/user');
mongoose.connect('mongodb://127.0.0.1/nnfl');
var newUser            = new User();
newUser.username = "admin";
newUser.password = newUser.generateHash("admin");
newUser.name = "Amey Agrawal";
newUser.isAdmin = true;
newUser.save(function(err) {
    if (err)
        throw err;
    console.log("Added");
    return;
});
