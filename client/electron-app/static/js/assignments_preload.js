const { app } = require('electron').remote;
const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')
const request = require('request')
const unzip = require('unzip')

global.isAssignment = (assignmentName) => {
    // Get path to assignment
    var userDataPath = app.getPath('userData');
    var assignmentFilePath = path.join(userDataPath, 'assignments', assignmentName)
    // Check if file is present
    return fs.existsSync(assignmentFilePath)
}

global.listPythonNotebooks = (assignmentName) => {
	var userDataPath = app.getPath('userData');
    var assignmentDir = path.join(userDataPath, 'assignments', assignmentName);

    return fs.readdirSync(assignmentDir).filter(file => file.endsWith('.ipynb'));
}

global.downloadAssignment = (assignmentName, assignmentURL) => {
	var userDataPath = app.getPath('userData');
	var tempPath = app.getPath('temp');
    var assignmentDir = path.join(userDataPath, 'assignments', assignmentName);

    var tempFileName = path.join(userDataPath, Date.now() + '.zip');
	var download = require('download-file')
 
	var options = {
	    directory: userDataPath,
	    filename: Date.now() + '.zip'
	}

    request({url: assignmentURL, encoding: null})
    	.pipe(fs.createWriteStream(tempFileName))
		.on('close', function() {
			fs.createReadStream(tempFileName).pipe(unzip.Extract({ path: assignmentDir }));
		});
}