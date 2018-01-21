var mongoose = require('mongoose');
var ShortId = require('mongoose-minid');

// define the schema for our user model
var assignmentSchema = mongoose.Schema({
    name : {
        type: String,
        unique: true,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    // acceptSubmission: Boolean,
    solutionsAvailable: Boolean,
    isEvaluative: Boolean,
    whoSubmitted: [String],
    notebooks: [{
        name: String,
        scores: [{
            username: String,
            value: Number
        }]
    }]
});

// create the model for assignments and expose it to our app
module.exports = mongoose.model('assignment', assignmentSchema);