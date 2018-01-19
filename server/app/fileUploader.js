var formidable = require('formidable')
var multer = require('multer')
var path = require('path')

function FileUploader(basePath) {
    
    this.problemsPath = 'assignments/problems'
    this.solutionsPath = 'assignments/solutions'
    this.submissionsPath = 'assignments/submissions'

    this.problemsFileName = 'problems.zip'
    this.solutionsFileName = 'solutions.zip'
    
    this.getProblemsPath = (assignmentName) => {
        return path.join(this.problemsPath, assignmentName, this.problemsFileName)
    }

    this.getSolutionPath = (assignmentName) => {
        return path.join(this.solutionsPath, assignmentName, this.solutionsFileName)
    }

    this.getSubmissPath = (assignmentName, username) => {
        return path.join(this.submissionsPath, assignmentName, username + '.zip')
    }

    this.fileFilter = function (req, file, cb) {
        if (path.extname(file.originalname) !== '.zip') {
            return cb(new Error('FileTypeNotSupported'));
        }
        cb(null, true);
    }

    this.problemsStorage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, this.problemsPath + req.params.assignmentName)
        },
        filename: function (req, file, callback) {
            callback(null, this.problemsFileName)   
        }
    })

    this.solutionsStorage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, this.solutionsPath + req.params.assignmentName)
        },
        filename: function (req, file, callback) {
            callback(null, this.solutionsFileName)
        }
    })

    this.submissionStorage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, this.submissionsPath + req.params.assignmentName)
        },
        filename: function (req, file, callback) {
            callback(null, req.user.username + '.zip')
        }
    })

    this.uploadProblems = multer({
        storage: this.releaseStorage,
        fileFilter: this.fileFilter,
        fieldname: 'problems'
    }).single('file')
    
    this.uploadSolutions = multer({
        storage: this.solutionsStorage,
        fileFilter: this.fileFilter,
        fieldname: 'solutions'
    }).single('file')

    this.uploadSubmission = multer({
        storage: this.submissionStorage,
        fileFilter: this.fileFilter
    }).single('file')
}

module.exports = new FileUploader()