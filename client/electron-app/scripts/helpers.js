const request = require('request');
const path = require('path');
const ejse = require('ejs-electron');

module.exports = {
    renderWebviewIndex: function (mainWindow, remoteServerAddr) {
        var remoteServerURL = "http://" + remoteServerAddr + "/login";

        request.get(remoteServerURL, function (err, body, res) {
            if (err) {
                console.log(err);

                ejse.data('remoteServerAddrPlaceholder', remoteServerAddr);
                ejse.data('message', 'Cannot connect to remote server');
                mainWindow.loadURL(path.join('file://', __dirname, '../views', 'remoteAddr.ejs'));
                return;
            }
            ejse.data('remoteServerAddr', remoteServerURL);
            mainWindow.loadURL(path.join('file://', __dirname, '../views', 'webview.ejs'));
        });
    }
}