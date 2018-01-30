var formidable = require('formidable')
var fs = require('fs-extra')
var mkdirp = require('mkdirp')
var multer = require('multer')
var ncp = require('ncp').ncp
var path = require('path')

function FileUploader(basePath) {
    self = this

    this.problemsBasePath = path.join('assignments', 'release')
    this.solutionsBasePath = path.join('assignments', 'source')
    this.submissionsBasePath = path.join('assignments', 'submitted')

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
            var tempDir = Math.random().toString(36).substring(7);
            if (file.fieldname == 'problems') {
                // dest = self.getProblemsPath(req.body.name)
                dest = path.join('assignments', tempDir)
                req.tempProblemsDir = dest
            } else if (file.fieldname == 'solutions') {
                // dest = self.getSolutionsPath(req.body.name)
                dest = path.join('assignments', tempDir)
                req.tempSoultionsDir = dest
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

    this.rmdirSync = (dir) => {
        if (!fs.existsSync(dir)) {
            return;
        }

        // var list = fs.readdirSync(dir);
        // for(var i = 0; i < list.length; i++) {
        //     var filename = path.join(dir, list[i]);
        //     var stat = fs.statSync(filename);

        //     if(filename == "." || filename == "..") {
        //         // pass these files
        //     } else if(stat.isDirectory()) {
        //         // rmdir recursively
        //         this.rmdir(filename);
        //     } else {
        //         // rm fiilename
        //         fs.unlinkSync(filename);
        //     }
        // }
        // fs.rmdirSync(dir);
        fs.removeSync(dir)
    }

    this.tempToFinal = (temp, assignmentName, type) => {
        var assignmentDest = '';
        if (type == 'problems') {
            assignmentDest = self.getProblemsPath(assignmentName)
        } else if (type == 'solutions') {
            assignmentDest = self.getSolutionsPath(assignmentName)
        } else {
            return;
        }

        if (fs.existsSync(assignmentDest)) {
            fs.removeSync(assignmentDest)
        }

        fs.copySync(temp, assignmentDest)
        fs.removeSync(temp)
    }

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