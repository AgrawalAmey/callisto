var csv = require("fast-csv");
var mongoose = require('mongoose');
var User = require('./app/models/user');


mongoose.connect('mongodb://127.0.0.1/ml');

csv
 .fromPath("passwords.csv")
 .on("data", function(data){
     console.log(data[1], data[3]);

	var newUser = new User();
	newUser.username = data[1];
	newUser.password = newUser.generateHash(data[3]);
	newUser.name = data[2];
	newUser.isAdmin = false;
	newUser.save(function(err) {
	    if (err)
	        throw err;
	    return;
	});

 })
 .on("end", function(){
     console.log("done");
 });