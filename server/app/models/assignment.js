var mongoose = require('mongoose');
var ShortId = require('mongoose-minid');

// define the schema for our user model
var assignmentSchema = mongoose.Schema({
    name : {
        type: String,
        unique: true
    },
    startTime: String,
    endTime : String,
    acceptSubmission: Boolean,
    solutionsAvailable: Boolean,
    feedbackAvailable: Boolean,
    whoSubmitted: [String] 
});

// create the model for assignments and expose it to our app
module.exports = mongoose.model('assignment', assignmentSchema);