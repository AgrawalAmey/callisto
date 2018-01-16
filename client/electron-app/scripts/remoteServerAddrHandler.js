// Vendor scripts
const fs = require('fs');

// =========================================================================
// Remote server address ===================================================
// =========================================================================

function RemoteServerAddrHandler() {
    this.getRemoteServerAddr = () => {
        var config = require('../config');
        return config.remoteServerAddr;
    }

    this.saveRemoteServerAddr = (remoteServerAddr) => {
        var config = require('../config');
        config.remoteServerAddr = remoteServerAddr;

        fs.writeFile("./config.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });
    }
}

module.exports = new RemoteServerAddrHandler()