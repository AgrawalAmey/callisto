// Vendor scripts
const { app } = require('electron')
const fs = require('fs');
const path = require('path');

// Custom scripts
const crypto_utils = require('./crypto_utils.js')

module.exports = {
    // =========================================================================
    // Remote server address ===================================================
    // =========================================================================
    
    getRemoteServerAddr: function () {
        var config = require('../config');
        return config.remoteServerAddr; 
    },

    saveRemoteServerAddr: function(remoteServerAddr) {
        var config = require('../config');
        config.remoteServerAddr = remoteServerAddr;

        fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });
    },

    // =========================================================================
    // Credential ==============================================================
    // =========================================================================

    saveCreds: (username, password) => {
        var encryptedCreds = { 
                "username": crypto_utils.encrypt(username),
                "password": crypto_utils.encrypt(password)
            }

        var tempDir = app.getPath('temp')
        var credsPath = path.join(tempDir, 'creds')
        
        fs.writeFileSync(credsPath, JSON.stringify(encryptedCreds, null, 2), function (err) {
            if (err) return console.log(err);
        });

        console.log(credsPath);
    },

    getCreds: () => {
        var tempDir = app.getPath('temp')
        var credsPath = path.join(tempDir, 'creds')

        var encryptedCreds = require(credsPath)

        var creds = {
            "username": crypto_utils.decrypt(username),
            "password": crypto_utils.decrypt(password)
        }

        return creds
    },

    removeCreds: () => {
        var tempDir = app.getPath('temp')
        var credsPath = path.join(tempDir, 'creds')

        if (fs.existsSync(credsPath)) {
            fs.unlinkSync(credsPath)
        }
    }
    
}