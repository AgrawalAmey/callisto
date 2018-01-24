const {ipcRenderer} = require('electron');

ipcRenderer.on('removeElement', function(event, id) {
	// var elem = document.querySelector('#' + id);
	// elem.parentNode.removeChild(elem);
	$('#' + id).toggle();
});