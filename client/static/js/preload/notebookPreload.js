const {ipcRenderer} = require('electron');

// Do something according to a request of your mainview
// ipcRenderer.on('request', function(){
//     ipcRenderer.sendToHost(getScripts());
// });

// ipcRenderer.on("alert-something",function(event,data){
//     alert(data);
// });

// ipcRenderer.on("change-text-element",function(event,data){
//     // the document references to the document of the <webview>
//     document.getElementById(data.id).innerHTML = data.text;
// });

ipcRenderer.on('saveNotebook', function(event) {
	var elem = document.getElementById('#save-notebook');
	elem.childNodes[0].click();
});

ipcRenderer.on('removeElement', function(event, id) {
	var elem = document.querySelector('#' + id);
	elem.parentNode.removeChild(elem);
});