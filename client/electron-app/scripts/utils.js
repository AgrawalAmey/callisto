const fs = require('fs');

module.exports = {
    // =========================================================================
    // Remote server window ====================================================
    // =========================================================================
    getRemoteServerAddr: function () {
        var config = require('../config');
        return config.remoteServerAddr; 
    },

    saveRemoteServerAddr: function(remoteServerAddr) {
        var config = require('../config');
        config.remoteServerAddr = remoteServerAddr;

        fs.writeFile(configFile, JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });
    }
}