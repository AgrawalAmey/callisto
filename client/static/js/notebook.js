const ipc = require('electron').ipcRenderer;
const webviewElem = document.getElementById("webview");

function goTo(assignment) {
    ipc.send('showAssignment', JSON.parse(assignment))
}

function submitNotebook(assignment, notebook) {
	webviewElem.send('saveNotebook');
    ipc.send('submitNotebook', assignment, notebook);
}

// When everything is ready, trigger the events without problems
webviewElem.addEventListener('dom-ready', function() {
    webviewElem.send('removeElement', 'header-container')
    webviewElem.send('removeElement', 'menubar')
})