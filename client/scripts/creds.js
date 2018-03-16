// Vendor scripts
const { app } = require('electron')
const fs = require('fs-extra');
const path = require('path');

// Custom scripts
const cipher = require('./cipher.js')
const config = require('../config')

function Creds() {

    this.getCredsPath = () => {
        if (this.credsPath == undefined) {
            var tempDir = app.getPath('temp')
            this.credsPath = path.join(tempDir, Date.now() + '.json')
        }

        return this.credsPath
    }

    this.login = (username, password) => {
        var credsPath = this.getCredsPath()
        var encryptedCreds = {
            username: cipher.encrypt(username),
            password: cipher.encrypt(password)
        }

        fs.writeFileSync(credsPath, JSON.stringify(encryptedCreds, null, 2), function (err) {
            if (err) return console.log(err);
        });
    }

    this.getCreds = () => {
        // var encryptedCreds = require(this.getCredsPath())
        var encryptedCreds = fs.readJsonSync(this.getCredsPath())

        var creds = {
            username: cipher.decrypt(encryptedCreds.username),
            password: cipher.decrypt(encryptedCreds.password)
        }

        return creds
    }

    this.logout = () => {
        var credsPath = this.getCredsPath()

        if (fs.existsSync(credsPath)) {
            fs.unlinkSync(credsPath)
        }
    }
}

module.exports = new Creds()