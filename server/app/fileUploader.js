var formidable = require('formidable')
var mkdirp = require('mkdirp')
var multer = require('multer')
var path = require('path')

function FileUploader(basePath) {
    self = this

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

    this.storage = multer.diskStorage({
        destination: function (req, file, callback) {
            if (file.fieldname == 'problems') {
                prefix = self.problemsPath
            } else if (file.fieldname == 'solutions') {
                prefix = self.solutionsPath
            } else if (file.fieldname == 'submissions') {
                prefix = self.submissionsPath
            }
            dest = path.join(prefix, req.body.name)
            mkdirp.sync(dest)
            callback(null, dest)
        },
        filename: function (req, file, callback) {
            switch (file.fieldname) {
                case 'problems':
                    callback(null, self.problemsFileName)
                    break;
                case 'solutions':
                    callback(null, self.solutionsFileName)
                    break;
                case 'submissions':
                    callback(null, req.user.username + '.zip')
            } 
        }
    })


    this.upload = multer({
        storage: this.storage,
        fileFilter: this.fileFilter
    }).fields([
        { name: 'problems'},
        { name: 'solutions'},
        { name: 'submissions' }
    ])
}

module.exports = new FileUploader()