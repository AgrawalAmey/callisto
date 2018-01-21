var fs = require('fs')
var unzip = require('unzip')

var Assignments = require('./models/assignment')
var fileUploader = require('./fileUploader')

function AssignmentHandler (){

    // =========================================================================
    // Render Assignments Page =================================================
    // ========================================================================= 

    this.isActive = (assignment) => {
        startDate = new Date(assignment.startTime)
        endDate = new Date(assignment.endTime)

        return (endDate - new Date() > 0 && startDate - new Date() < 0)
    }

    this.showToStudents = (assignment) => {
        startDate = new Date(assignment.startTime)

        return (new Date() - startDate > 0)
    }

    this.editOrCreateAssignment = (req, assignment) => {
        if (assignment == undefined) {
            var assignment = new Assignments()
        }

        assignment.name = req.body.name
        assignment.startTime = req.body.startTime
        assignment.endTime = req.body.endTime
        assignment.isEvaluative = req.body.isEvaluative || false
        assignment.solutionsAvailable = req.body.solutionsAvailable || false
        assignment.acceptSubmission = req.body.acceptSubmission || false

        return assignment
    }

    this.renderAssignmentsPage = (req, res) => {

        // asynchronous
        process.nextTick(() => {
            Assignments.find({}, (err, assignments) => {
                for (i = 0; i < assignments.length; i++) {
                    assignments[i].isSubmitted = req.user._id in assignments[i].whoSubmitted
                    assignments[i].isActive = this.isActive(assignments[i])
                    assignments[i].showToStudents = this.showToStudents(assignments[i])
                }

                res.render('assignments.ejs', {
                    user: req.user,
                    assignments: assignments,
                    alterAssignmentError: req.flash('alterAssignmentError'),
                    alterAssignmentSuccess: req.flash('alterAssignmentSuccess')
                })
            })
        })
    }

    // =====================================
    // Render assignment page ==============
    // =====================================

    this.renderAssignmentPage = (req, res) => {

        // asynchronous
        process.nextTick(() => {
            Assignments.findOne({ 'name': req.query.name }, (err, assignment) => {
                assignment.isSubmitted = false
                for (i = 0; i < assignment.whoSubmitted.length; i++) {
                    if (assignment.whoSubmitted[i] == req.user.username) {
                        assignment.isSubmitted = true
                        break
                    }
                }

                scores = assignment.notebooks.map((notebook) => {
                    score = notebook.scores.find(score => score.username == req.user.username)
                    // If user has not submitted
                    if (score == undefined){
                        score = 0
                    }
                    return score
                })

                assignment.isActive = this.isActive(assignment)
                assignment.showToStudents = this.showToStudents(assignment)

                if (assignment.showToStudents || req.user.isAdmin) {
                    res.render('assignment.ejs', {
                        user: req.user,
                        assignment: assignment,
                        scores: scores,
                        uploadAssignmentError: req.flash('uploadAssignmentError'),
                        uploadAssignmentSuccess: req.flash('uploadAssignmentSuccess'),
                    })
                } else {
                    res.redirect('/assignments')
                }
            })
        })
    }

    // =========================================================================
    // Serve problems ==========================================================
    // ========================================================================= 

    this.serveProblems = (req, res) => {
        // asynchronous
        process.nextTick(() => {
            Assignments.findOne({ 'name': req.params.assignmentName }, (err, assignment) => {
                assignment.isActive = this.isActive(assignment)
                assignment.showToStudents = this.showToStudents(assignment)

                if (assignment.showToStudents || req.user.isAdmin) {
                    res.download(fileUploader.getProblemsPath(assignment.name))
                } else {
                    res.redirect('/assignments')
                }
            })
        })
    }

    // =========================================================================
    // Serve solutions =========================================================
    // ========================================================================= 

    this.serveSolutions = (req, res) => {
        // asynchronous
        process.nextTick(() => {
            Assignments.findOne({ 'name': req.params.assignmentName }, (err, assignment) => {
                assignment.isActive = this.isActive(assignment)
                assignment.showToStudents = this.showToStudents(assignment)

                if ((assignment.showToStudents && assignment.solutionsAvailable) || req.user.isAdmin) {
                    res.download(fileUploader.getSolutionsPath(assignment.name))
                } else {
                    res.redirect('/assignments')
                }
            })
        })
    }


    // =====================================
    // Submission upload              ======
    // ===================================== 

    this.uploadSubmission = (req, res) => {
        // asynchronous
        process.nextTick(() => {
            Assignments.findOne({ 'name': req.params.assignmentName }, (err, assignment) => {
                
                assignment.isActive = this.isActive(assignment)

                if (assignment.isActive || req.user.isAdmin) {
                    fileUploader.upload(req, res, (err) => {
                        if (err) {
                            if (err.message == 'FileTypeNotSupported') {
                                req.flash('uploadAssignmentError', 'Only zip files are supported.')
                            } else {
                                req.flash('uploadAssignmentError', 'Oops! Something went wrong.')
                            }
                            res.redirect('/assignment?name=' + req.params.assignmentName)
                        } else {
                            assignment.whoSubmitted.push(req.user.username)

                            assignment.save((err, editedUser) => {
                                if (err) {
                                    req.flash('uploadAssignmentError', 'Oops! Something went wrong.')
                                } else {
                                    req.flash('uploadAssignmentSuccess', 'Assignment submitted successfully.')
                                }
                                res.redirect('/assignment?name=' + req.params.assignmentName)
                                return
                            })
                        }
                    })
                } else {
                    res.redirect('/assignment?name=' + req.params.assignmentName)
                }
            })
        })
    }


    // =========================================================================
    // Manage Assignments ======================================================
    // ========================================================================= 

    this.manageAssignments = (req, res) => {

        // asynchronous
        process.nextTick(() => {
            Assignments.find({}, (err, assignments) => {
                res.render('manage_assignments.ejs', {
                    user: req.user,
                    assignments: assignments,
                    addAssignmentError: req.flash('addAssignmentError'),
                    editAssignmentError: req.flash('editAssignmentError'),
                    removeAssignmentError: req.flash('removeAssignmentError'),
                    addAssignmentSuccess: req.flash('addAssignmentSuccess'),
                    editAssignmentSuccess: req.flash('editAssignmentSuccess'),
                    removeAssignmentSuccess: req.flash('removeAssignmentSuccess'),
                })
            })
        })
    }

    // =========================================================================
    // Add Assignment =============================================================
    // =========================================================================

    this.addAssignment = (req, res) => {

        // asynchronous
        process.nextTick(() => {

            fileUploader.upload(req, res, (err) => {
                if (err) {
                    console.log(err)
                    if (err.message == 'FileTypeNotSupported') {
                        req.flash('alterAssignmentError', 'Select a zip file for uploading problems.')
                    } else {
                        req.flash('alterAssignmentError', 'Oops! Something went wrong.')
                    }

                    res.redirect('/assignments')
                    return
                }

                Assignments.findOne({ 'name': req.body.name }, (err, existingAssignment) => {

                    if (err) {
                        req.flash('alterAssignmentError', 'Oops! Something went wrong.')
                        res.redirect('/assignments')
                        return
                    }


                    // check to see if there's already a assignment with that email
                    if (existingAssignment) {
                        req.flash('alterAssignmentError', 'That name is already taken.')
                        res.redirect('/assignments')
                        return
                    }

                    var newAssignment = this.editOrCreateAssignment(req)

                    newAssignment.save((err) => {
                        if (err) {
                            console.log(err)
                            req.flash('alterAssignmentError', 'Oops! Something went wrong.')
                            res.redirect('/assignments')
                            return
                        }
                        
                        this.updateNotebooksDatabase(newAssignment)

                        req.flash('alterAssignmentSuccess', 'Assignment added successfully.')
                        res.redirect('/assignments')
                        return
                    })
                })
            })
        })
    },

    // =========================================================================
    // Edit Assignment =========================================================
    // =========================================================================

    this.editAssignment = (req, res) => {

        // asynchronous
        process.nextTick(() => {

            fileUploader.upload(req, res, (err) => {
                if (err) {
                    console.log(err)
                    if (err.message == 'FileTypeNotSupported') {
                        req.flash('alterAssignmentError', 'Select a zip file for uploading problems.')
                    } else {
                        req.flash('alterAssignmentError', 'Oops! Something went wrong.')
                    }

                    res.redirect('/assignments')
                    return
                }

                Assignments.findOne({ 'name': req.body.oldName }, (err, existingAssignment) => {

                    if (err) {
                        req.flash('alterAssignmentError', 'Oops! Something went wrong.')
                        res.redirect('/assignments')
                        return
                    }

                    existingAssignment = this.editOrCreateAssignment(req, existingAssignment)

                    existingAssignment.save((err) => {
                        if (err) {
                            console.log(err)
                            req.flash('alterAssignmentError', 'Oops! Something went wrong.')
                            res.redirect('/assignments')
                            return
                        }

                        this.updateNotebooksDatabase(existingAssignment)

                        req.flash('alterAssignmentSuccess', 'Assignment edited successfully.')

                        res.redirect('/assignments')
                        return
                    })
                })
            })
        })
    },


    // =========================================================================
    // Remove Assignment ==========================================================
    // ========================================================================= 

    this.removeAssignment = (req, res) => {

        // asynchronous
        process.nextTick(() => {

            Assignments.remove({ 'name': req.body.name }, (err) => {

                // if there are any errors, return the error
                if (err) {
                    req.flash('alterAssignmentError', 'Oops! Something went wrong.')
                    res.redirect('/assignments')
                    return
                }

                req.flash('alterAssignmentSuccess', 'Assignment removed successfully.')
                res.redirect('/assignments')
                return
            })
        })
    },

    // =========================================================================
    // Update notebook database ================================================
    // ========================================================================= 

    this.updateNotebooksDatabase = (assignment) => {

        // asynchronous
        process.nextTick(() => {
            var problemsZipPath = fileUploader.getProblemsZipPath(assignment.name)
            var problemsUnzipPath = fileUploader.getProblemsPath(assignment.name) + '/problems'

            var solutionsZipPath = fileUploader.getSolutionsZipPath(assignment.name)
            var solutionsUnzipPath = fileUploader.getSolutionsPath(assignment.name) + '/solutions'

            if (fs.existsSync(solutionsZipPath)) {
                fs.createReadStream(solutionsZipPath)
                    .pipe(unzip.Extract({ path: solutionsUnzipPath }))
            }
            if (fs.existsSync(problemsZipPath)){
                fs.createReadStream(problemsZipPath)
                    .pipe(unzip.Extract({ path: problemsUnzipPath }))
                    .on('close', () => {
                        var notebooks = fs.readdirSync(problemsUnzipPath)
                                          .filter(file => file.endsWith('.ipynb'))

                        assignment.notebooks = notebooks.map((notebook) => {
                            return {
                                name: notebook, 
                                scores: []
                            }
                        })
                        
                        assignment.save((err) => {
                            if (err) {
                                console.log(err)
                            }
                        })
                    })
            }
        })
    }
}

module.exports = new AssignmentHandler()