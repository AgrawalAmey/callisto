const {ipcRenderer} = require('electron');

ipcRenderer.on('saveNotebook', function(event) {
	var elem = document.getElementById('save-notbook');
	elem.childNodes[0].click();
});

ipcRenderer.on('removeElement', function(event, id) {
	$('#' + id).toggle();
});