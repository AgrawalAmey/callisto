var fs = require('fs')
var unzip = require('unzip')

var Assignments = require('./models/assignment')
var fileUploader = require('./fileUploader')

module.exports = {

    // =========================================================================
    // Render Assignments Page =================================================
    // ========================================================================= 

    renderAssignmentsPage: function (req, res) {

        // asynchronous
        process.nextTick(function () {
            Assignments.find({}, function (err, assignments) {
                for (i = 0; i < assignments.length; i++) {
                    startDate = new Date(assignments[i].startTime)
                    endDate = new Date(assignments[i].endTime)
                    assignments[i].isSubmitted = req.user._id in assignments[i].whoSubmitted
                    assignments[i].isActive = (endDate - new Date() > 0 && startDate - new Date() < 0)
                    assignments[i].showToStudents = (new Date() - startDate > 0)
                }
                res.render('assignments.ejs', {
                    user: req.user,
                    assignments: assignments
                })
            })
        })
    },

    // =====================================
    // Render assignment page ==============
    // =====================================

    renderAssignmentPage: function (req, res) {

        // asynchronous
        process.nextTick(function () {
            Assignments.findOne({ 'name': req.query.name }, function (err, assignment) {
                startDate = new Date(assignment.startTime);
                endDate = new Date(assignment.endTime);
                assignment.isSubmitted = false;
                for (i = 0; i < assignment.whoSubmitted.length; i++) {
                    if (assignment.whoSubmitted[i] == req.user.username) {
                        assignment.isSubmitted = true;
                        break;
                    }
                }

                assignment.isActive = (endDate - new Date() > 0 && startDate - new Date() < 0);
                assignment.showToStudents = (new Date() - startDate > 0);

                if (assignment.showToStudents || req.user.isAdmin) {
                    res.render('assignment.ejs', {
                        user: req.user,
                        assignment: assignment,
                        notebooks: ["1", "2"],
                        solutions: ["1", "3"],
                        uploadAssignmentError: req.flash('uploadAssignmentError'),
                        uploadAssignmentSuccess: req.flash('uploadAssignmentSuccess'),
                    });
                } else {
                    res.redirect('/assignments');
                }
            });
        })
    },

    // =========================================================================
    // Serve problems ==========================================================
    // ========================================================================= 

    serveProblems: function (req, res) {
        // asynchronous
        process.nextTick(function () {
            Assignments.findOne({ 'name': req.params.assignmentName }, function (err, assignment) {
                startDate = new Date(assignment.startTime);
                endDate = new Date(assignment.endTime);
                assignment.isActive = (endDate - new Date() > 0 && startDate - new Date() < 0);
                assignment.showToStudents = (new Date() - startDate > 0);
                if (assignment.showToStudents || req.user.isAdmin) {
                    res.download(fileUploader.getProblemsPath(assignment.name));
                } else {
                    res.redirect('/assignments');
                }
            });
        })
    },

    // =========================================================================
    // Serve solutions =========================================================
    // ========================================================================= 

    serveSolutions: function (req, res) {
        // asynchronous
        process.nextTick(function () {
            Assignments.findOne({ 'name': req.params.assignmentName }, function (err, assignment) {
                startDate = new Date(assignment.startTime);
                endDate = new Date(assignment.endTime);
                assignment.isActive = (endDate - new Date() > 0 && startDate - new Date() < 0);
                assignment.showToStudents = (new Date() - startDate > 0);
                if ((assignment.showToStudents && assignment.solutionsAvailable) || req.user.isAdmin) {
                    res.download(fileUploader.getSolutionsPath(assignment.name));
                } else {
                    res.redirect('/assignments');
                }
            });
        })
    },


    // =====================================
    // Submission upload              ======
    // ===================================== 

    uploadSubmission: function (req, res) {
        // asynchronous
        process.nextTick(function () {
            Assignments.findOne({ 'name': req.params.assignmentName }, function (err, assignment) {
                startDate = new Date(assignment.startTime);
                endDate = new Date(assignment.endTime);
                assignment.isActive = (endDate - new Date() > 0 && startDate - new Date() < 0);
                if (assignment.isActive || req.user.isAdmin) {
                    fileUploader.upload(req, res, function (err) {
                        if (err) {
                            if (err.message == 'FileTypeNotSupported') {
                                req.flash('uploadAssignmentError', 'Only zip files are supported.');
                            } else {
                                req.flash('uploadAssignmentError', 'Oops! Something went wrong.');
                            }
                            res.redirect('/assignment?name=' + req.params.assignmentName);
                        } else {
                            assignment.whoSubmitted.push(req.user.username);

                            assignment.save(function (err, editedUser) {
                                if (err) {
                                    req.flash('uploadAssignmentError', 'Oops! Something went wrong.');
                                } else {
                                    req.flash('uploadAssignmentSuccess', 'Assignment submitted successfully.');
                                }
                                res.redirect('/assignment?name=' + req.params.assignmentName);
                                return;
                            });
                        }
                    });
                } else {
                    res.redirect('/assignment?name=' + req.params.assignmentName);
                }
            });
        })
    },


    // =========================================================================
    // Manage Assignments ======================================================
    // ========================================================================= 

    manageAssignments: function (req, res) {

        // asynchronous
        process.nextTick(function () {
            Assignments.find({}, function (err, assignments) {
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
            })
        })
    },

    // =========================================================================
    // Add Assignment =============================================================
    // =========================================================================

    addAssignment: function (req, res) {

        // asynchronous
        process.nextTick(function () {

            fileUploader.upload(req, res, function (err) {
                if (err) {
                    console.log(err)
                    if (err.message == 'FileTypeNotSupported') {
                        req.flash('addAssignmentError', 'Select a zip file for uploading problems.');
                    } else {
                        req.flash('addAssignmentError', 'Oops! Something went wrong.');
                    }

                    res.redirect('/manageAssignments');
                    return;
                }

                Assignments.findOne({ 'name': req.body.name }, function (err, existingAssignment) {

                    if (err) {
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
                    newAssignment.acceptSubmission = req.body.acceptSubmission || false;


                    newAssignment.save(function (err) {
                        if (err) {
                            console.log(err)
                            req.flash('addAssignmentError', 'Oops! Something went wrong.');
                            res.redirect('/manageAssignments');
                            return;
                        }
                        
                        req.flash('addAssignmentSuccess', 'Assignment added successfully.');

                        res.redirect('/manageAssignments');
                        return;
                    })
                })
            })
        });
    },

    // =========================================================================
    // Edit Assignment =========================================================
    // =========================================================================

    editAssignment: function (req, res) {

        // asynchronous
        process.nextTick(function () {

            fileUploader.upload(req, res, function (err) {
                if (err) {
                    console.log(err)
                    if (err.message == 'FileTypeNotSupported') {
                        req.flash('editAssignmentError', 'Select a zip file for uploading problems.');
                    } else {
                        req.flash('editAssignmentError', 'Oops! Something went wrong.');
                    }

                    res.redirect('/manageAssignments');
                    return;
                }

                Assignments.findOne({ 'name': req.body.oldName }, function (err, existingAssignment) {

                    if (err) {
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

                    existingAssignment.save(function (err) {
                        if (err) {
                            console.log(err)
                            req.flash('editAssignmentError', 'Oops! Something went wrong.');
                            res.redirect('/manageAssignments');
                            return;
                        }

                        req.flash('editAssignmentSuccess', 'Assignment edited successfully.');

                        res.redirect('/manageAssignments');
                        return;
                    })
                })
            })
        });
    },


    // =========================================================================
    // Remove Assignment ==========================================================
    // ========================================================================= 

    removeAssignment: function (req, res) {

        // asynchronous
        process.nextTick(function () {

            Assignments.remove({ 'name': req.body.name }, function (err) {

                // if there are any errors, return the error
                if (err) {
                    req.flash('removeAssignmentError', 'Oops! Something went wrong.');
                    res.redirect('/manageAssignments');
                    return;
                }

                req.flash('removeAssignmentSuccess', 'Assignment removed successfully.');
                res.redirect('/manageAssignments');
                return;
            });
        });
    },

    // =========================================================================
    // Update notebook database ================================================
    // ========================================================================= 

    updateNotebooksDatabase: function (req, res) {

        // asynchronous
        process.nextTick(function () {

            Assignments.findOne({ 'name': req.body.name }, function (assignment) {

                // if there are any errors, return the error
                if (err) {
                    req.flash('updateNotebooksDatabase', 'Oops! Something went wrong.');
                    res.redirect('/manageAssignments');
                    return;
                }

                req.flash('updateNotebooksDatabase', 'Assignment removed successfully.');
                res.redirect('/manageAssignments');
                return;
            });
        });
    }
}