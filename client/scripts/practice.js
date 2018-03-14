// Load vender scripts
const { app } = require('electron');
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

// Load custom scripts
const assignments = require('./assignments')
const creds = require('./creds')

function Practice() {
    this.NBList = (callback) => {
        var practiceNBPath = app.getPath('userData');
        practiceNBPath = path.join(practiceNBPath, 'assignments', creds.getCreds().username, 'practice');

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

module.exports = new Practice()