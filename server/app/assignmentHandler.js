var config = require('../config')
var fs = require('fs')
var path = require('path')
var showdown = require('showdown')
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
        assignment.allowZipSubmission = req.body.allowZipSubmission || false
        assignment.isEvaluative = req.body.isEvaluative || false
        assignment.isEvaluated = req.body.isEvaluated || false
        assignment.solutionsAvailable = req.body.solutionsAvailable || false
        assignment.acceptSubmission = req.body.acceptSubmission || false

        return assignment
    }

    this.renderAssignmentsPage = (req, res) => {

        // asynchronous
        process.nextTick(() => {
            Assignments.find({}, (err, assignments) => {
                
                if (err) {
                    res.redirect('/logout')
                    return
                }

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

                if (err || !assignment) {
                    res.redirect('/assignments')
                    return
                }

                var totalScore = 0

                for (let i = 0; i < assignment.notebooks.length; i++) {
                    submission = assignment.notebooks[i].submissions.find(submission => submission.username == req.user.username)
                                        
                    // If user has not submitted
                    if (!submission) {
                        score = 0
                        attemptsRemaining = config.maxSubmissionAttempts
                    } else {
                        score = submission.score
                        attemptsRemaining = config.maxSubmissionAttempts - submission.attempts
                    }

                    totalScore += score
                    assignment.notebooks[i] = {
                        name: assignment.notebooks[i].name, 
                        score: score,
                        attemptsRemaining: attemptsRemaining,
                        isSubmitted: attemptsRemaining != config.maxSubmissionAttempts,
                        numSubmissions: assignment.notebooks[i].submissions.length
                    }
                }

                assignment.isActive = this.isActive(assignment)
                assignment.showToStudents = this.showToStudents(assignment)

                if (assignment.showToStudents || req.user.isAdmin) {
                    res.render('assignment.ejs', {
                        user: req.user,
                        assignment: assignment,
                        totalScore: totalScore
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
                if (err) {
                    res.status(500).send('Oops! Something went wrong.')
                    return
                }

                if (!assignment) {
                    res.status(400).send('Invalid assignment name.')
                    return
                }

                assignment.isActive = this.isActive(assignment)
                assignment.showToStudents = this.showToStudents(assignment)

                var filePath = fileUploader.getProblemsZipPath(assignment.name)

                if (assignment.showToStudents || req.user.isAdmin) {
                    fs.access(filePath, (err) => {
                        if(err) {
                            res.status(404).send('Problems not available yet.')
                        } else {
                            res.download(filePath)
                        }
                    })
                } else {
                    res.status(401).send('Problems not available for students yet.')
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

                if (err) {
                    res.status(500).send('Oops! Something went wrong.')
                    return
                }

                if (!assignment) {
                    res.status(400).send('Invalid assignment name.')
                    return
                }

                assignment.isActive = this.isActive(assignment)
                assignment.showToStudents = this.showToStudents(assignment)

                var filePath = fileUploader.getSolutionsZipPath(assignment.name)

                if ((assignment.showToStudents && assignment.solutionsAvailable) || req.user.isAdmin) {
                    fs.access(filePath, (err) => {
                        if(err) {
                            res.status(404).send('Solutions not available yet.')
                        } else {
                            res.download(filePath)
                        }
                    })
                } else {
                    res.status(401).send('Solutions not available for students yet.')
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
               
                if(err){
                    res.status(500).send('Oops! Something went wrong.')
                    return
                }

                if (!assignment) {
                    res.status(400).send('Invalid assignment name.')
                    return
                }

                assignment.isActive = this.isActive(assignment)

                if (assignment.isActive) {
                    fileUploader.upload(req, res, (err) => {
                        if (err) {
                            console.log(err)
                            res.status(500).send('Oops! Something went wrong.')
                            return
                        } else {
                            var notebookIndex = assignment.notebooks.findIndex((notebook) => {
                                return notebook.name == req.params.notebook
                            })

                            if (notebookIndex < 0) {
                                res.status(400).send('Invalid notebook name.')
                                return
                            }

                            var submissionIndex = assignment.notebooks[notebookIndex].submissions.findIndex((submission) => {
                                return submission.username == req.user.username
                            })

                            if (submissionIndex < 0) {
                                submissionIndex = assignment.notebooks[notebookIndex].submissions.length
                                
                                assignment.notebooks[notebookIndex].submissions.push({
                                    username: req.user.username,
                                    attempts: 0,
                                    score: 0
                                })
                            }

                            
                            attempts = ++assignment.notebooks[notebookIndex].submissions[submissionIndex].attempts
                            attemptsRemaining = config.maxSubmissionAttempts - attempts

                            if (attemptsRemaining <0){
                                res.status(400).send('Maximum submission limit reached.')
                            }

                            var score = 1
                            assignment.notebooks[notebookIndex].submissions[submissionIndex].score = score

                            if (!assignment.whoSubmitted.includes(req.user.username)) {
                                assignment.whoSubmitted.push(req.user.username)
                            }

                            assignment.save((err, editedUser) => {
                                if (err) {
                                    console.log(err)
                                    res.status(500).send('Oops! Something went wrong.')
                                } else {
                                    res.json({score: score, attemptsRemaining: attemptsRemaining})
                                }

                                return
                            })
                        }
                    })
                } else {
                    res.status(500).send('Assignment is no longer accepting submissions.')
                }
            })
        })
    }

    // =====================================
    // Zip submission upload          ======
    // ===================================== 

    this.uploadZipSubmission = (req, res) => {
        // asynchronous
        process.nextTick(() => {
            Assignments.findOne({ 'name': req.params.assignmentName }, (err, assignment) => {

                if (err) {
                    res.status(500).send('Oops! Something went wrong.')
                    return
                }

                if (!assignment) {
                    res.status(400).send('Invalid assignment name.')
                    return
                }

                assignment.isActive = this.isActive(assignment)

                if (assignment.isActive) {
                    fileUploader.upload(req, res, (err) => {
                        if (err) {
                            console.log(err)
                            res.status(500).send('Oops! Something went wrong.')
                            return
                        } else {
                            var notebookIndex = assignment.notebooks.findIndex((notebook) => {
                                return notebook.name == req.params.notebook
                            })

                            if (notebookIndex < 0) {
                                res.status(400).send('Invalid notebook name.')
                                return
                            }

                            var submissionIndex = assignment.notebooks[notebookIndex].submissions.findIndex((submission) => {
                                return submission.username == req.user.username
                            })

                            if (submissionIndex < 0) {
                                submissionIndex = assignment.notebooks[notebookIndex].submissions.length

                                assignment.notebooks[notebookIndex].submissions.push({
                                    username: req.user.username,
                                    attempts: 0,
                                    score: 0
                                })
                            }


                            attempts = ++assignment.notebooks[notebookIndex].submissions[submissionIndex].attempts
                            attemptsRemaining = config.maxSubmissionAttempts - attempts

                            if (attemptsRemaining < 0) {
                                res.status(400).send('Maximum submission limit reached.')
                            }

                            var score = 1
                            assignment.notebooks[notebookIndex].submissions[submissionIndex].score = score

                            if (!assignment.whoSubmitted.includes(req.user.username)) {
                                assignment.whoSubmitted.push(req.user.username)
                            }

                            assignment.save((err, editedUser) => {
                                if (err) {
                                    console.log(err)
                                    res.status(500).send('Oops! Something went wrong.')
                                } else {
                                    res.json({ score: score, attemptsRemaining: attemptsRemaining })
                                }

                                return
                            })
                        }
                    })
                } else {
                    res.status(500).send('Assignment is no longer accepting submissions.')
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
                if (err) {
                    res.redirect('/logout')
                    return
                }

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
            var problemsUnzipPath = fileUploader.getProblemsPath(assignment.name)

            var solutionsZipPath = fileUploader.getSolutionsZipPath(assignment.name)
            var solutionsUnzipPath = fileUploader.getSolutionsPath(assignment.name)

            if (fs.existsSync(solutionsZipPath)) {
                fs.createReadStream(solutionsZipPath)
                    .pipe(unzip.Extract({ path: solutionsUnzipPath }))
            }
            if (fs.existsSync(problemsZipPath)){
                fs.createReadStream(problemsZipPath)
                    .pipe(unzip.Extract({ path: problemsUnzipPath }))
                    .on('close', () => {
                        var problemsDirFiles = fs.readdirSync(problemsUnzipPath)
                        
                        var readme = problemsDirFiles.filter(file => file.toLowerCase() == 'readme.md')

                        if (readme.length > 0) {
                            converter = new showdown.Converter()
                            var text = fs.readFileSync(path.join(problemsUnzipPath, readme[0]), 'utf8')
                            try {
                                assignment.readme = converter.makeHtml(text)
                            } catch(err) {
                                console.log(err)
                            }
                        }
                        var notebooks = problemsDirFiles.filter(file => file.endsWith('.ipynb'))
                        
                        assignment.notebooks = notebooks.map((notebook) => {
                            return {
                                name: notebook,
                                submissions: []
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

    // =========================================================================
    // Update notebook database ================================================
    // ========================================================================= 

}

module.exports = new AssignmentHandler()