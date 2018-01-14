// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const configFile = './config.json'
const config = require(configFile);
const fs = require('fs');
const ipc = require('electron').ipcRenderer;

// var serverBtn = document.getElementById('serverBtn');
// serverBtn.addEventListener('click', function () {
	

// 	config.remoteServer.host = document.getElementById('remoteServerAddr').value.split(':')[0];
// 	config.remoteServer.port = document.getElementById('remoteServerAddr').value.split(':')[1];

// 	fs.writeFile(configFile, JSON.stringify(config, null, 2), function (err) {
// 	  	if (err) return console.log(err);
// 	  	console.log('writing to ' + fileName);
// 	  	ipc.send('serverBtn-click');
// 	  	console.log('Hello');
// 	});
// 	ipc.send('serverBtn-click');
// });

$(function(){
	$("#serverForm").submit(false);
    $("#serverForm").validate({
        rules: {
            remoteServerAddr: {
                required: true
            }
        },
        submitHandler: function(form) {
            console.log('hilo');
   //          // ipc.send('serverBtn-click');
   //          config.remoteServer.host = $('#remoteServerAddr').value.split(':')[0];
			// config.remoteServer.port = $('#remoteServerAddr').value.split(':')[1];
			ipc.send('serverBtn-click', $('#remoteServerAddr').val());
			// fs.writeFile(configFile, JSON.stringify(config, null, 2), function (err) {
			//   	if (err) return console.log(err);
			//   	console.log('writing to ' + fileName);
			//   	ipc.send('serverBtn-click', config);
			//   	console.log('Hello');
			// });
			// ipc.send('serverBtn-click');
        }
    });
});