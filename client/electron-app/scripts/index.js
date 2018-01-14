// const electron = require('electron');
// var electronEjs = require('electron-ejs')();
// const config = require('./config');

// const request = require('request');
// const path = require('path');

// const remoteServerAddr = 'http://' + config.remoteServer.host + config.remoteServer.port;

// request.get(remoteServerAddr, function(err, body, res) {
// 	if(err) {
// 		electron.remote.getCurrentWindow().loadURL(path.join(__dirname, 'views', 'remoteAddr.ejs'));
// 	} else {
		
// 		var ejs = new electronEjs({remoteServerAddr : remoteServerAddr}, {});
// 		electron.remote.getCurrentWindow().loadURL(path.join(__dirname, 'views', 'webview.ejs'));

// 	}
// });