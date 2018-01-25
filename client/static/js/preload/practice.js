const { ipcRenderer } = require('electron')
const app = require('electron').remote.app;
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const request = require('request')

const config = require('../../../config')

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

	this.openNB = (notebook) => {
	    ipcRenderer.send('showPracticeNB', notebook);
	}

	this.newNB = (name, callback) => {
		var tokenFile = path.join(app.getPath('temp'), 'tokenFile.txt');

		fs.readFile(tokenFile, (err, data) => {
            if (err) {
                throw err;
            } else {
                var token = data.toString();
                var opts = {
                	method: 'POST',
					url: 'http://' + config.jupyterAddr + '/contents/practice',
					qs: {
						token: token
					},
					body: {
						type: 'notebook'
					}
				}

				request(opts, (err, response, body) => {
					if (err) {
						throw err;
					} else {
						var options = { 
							method: 'PATCH',
  							url: 'http://' + config.jupyterAddr + '/contents/practice/' + body.name,
  							qs: { 
  								token: token 
  							},
  							body: {
  								path: 'practice/' + name
  							} 
  						};

						request(options, (error2, response2, body2) => {
  							if (error2) { 
  								throw new Error(error2);
  							} else {
 								callback();
 							}
						});
					}
				});
            }
        });
	}

	this.copyNewNB = (name) => {
		var practiceNBPath = app.getPath('userData');
	    practiceNBPath = path.join(practiceNBPath, 'assignments', 'practice', name);
		fs.readFile(path.join(__dirname, '..', '..', 'templates', 'Template.ipynb'), (err, data) => {
			if (err) {
				throw err;
			} else {
				fs.writeFile(practiceNBPath, data.toString(), (err) => {
					if (err) {
						throw err;
					} else {
						console.log(name);
						this.openNB(name);
					}
				});
			}
		});
	}

	this.deleteNB = (name, callback) => {
		var practiceNBPath = app.getPath('userData');
	    practiceNBPath = path.join(practiceNBPath, 'assignments', 'practice', name)
		fs.unlink(practiceNBPath, (err) => {
			if (err) {
				throw err;
			} else {
				callback();
			}
		});
	}
}

global.practice = new Practice()