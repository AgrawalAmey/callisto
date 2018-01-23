const { ipcRenderer } = require('electron')
const app = require('electron').remote.app;
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

function Practice() {
    this.NBList = (callback) => {
	    var practiceNBPath = app.getPath('userData');
	    practiceNBPath = path.join(practiceNBPath, 'assignments', 'practice');

	    fs.access(practiceNBPath, (err) => {
	        if (err) {
	            mkdirp.sync(practiceNBPath);
	            callback([]);
	        } else {
	            fs.readdir(practiceNBPath, (err, list) => {
	                callback(list);
	            });
	        }
	    })
	}
}

global.practice = new Practice()