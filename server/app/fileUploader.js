var formidable = require('formidable')
var mkdirp = require('mkdirp')
var multer = require('multer')
var path = require('path')

function FileUploader(basePath) {
    self = this

    this.problemsBasePath = 'assignments/release'
    this.solutionsBasePath = 'assignments/source'
    this.submissionsBasePath = 'assignments/submitted'

    this.problemsFileName = 'release.zip'
    this.solutionsFileName = 'source.zip'
    
    this.getProblemsPath = (assignmentName) => {
        return path.join(this.problemsBasePath, assignmentName)
    }

    this.getSolutionsPath = (assignmentName) => {
        return path.join(this.solutionsBasePath, assignmentName)
    }

    this.getSubmissionsPath = (username, assignmentName) => {
        return path.join(this.submissionsBasePath, username, assignmentName)
    }

    this.getProblemsZipPath = (assignmentName) => {
        return path.join(this.getProblemsPath(assignmentName), this.problemsFileName)
    }

    this.getSolutionsZipPath = (assignmentName) => {
        return path.join(this.getSolutionsPath(assignmentName), this.solutionsFileName)
    }

    this.getSubmissonsNoetbookPath = (username, assignmentName, notebook) => {
        return path.join(this.getSubmissionsPath(username, assignmentName), notebook)
    }


    this.fileFilter = function (req, file, cb) {
        switch (file.fieldname) {
            case 'problems':
            case 'solutions':
                if (path.extname(file.originalname) !== '.zip') {
                    return cb(new Error('FileTypeNotSupported'));        
                }
                break;
            case 'submissions':
                if (path.extname(file.originalname) !== '.ipynb') {
                    return cb(new Error('FileTypeNotSupported'));
                }
        } 
        
        cb(null, true);
    }

    this.storage = multer.diskStorage({
        destination: function (req, file, callback) {
            console.log(file)
            if (file.fieldname == 'problems') {
                dest = self.getProblemsPath(req.body.name)
            } else if (file.fieldname == 'solutions') {
                dest = self.getSolutionsPath(req.body.name)
            } else if (file.fieldname == 'submissions') {
                dest = self.getSubmissionsPath(req.user.username, req.params.assignmentName)
            }

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
                    callback(null, req.params.notebook)
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