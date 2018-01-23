const ipc = require('electron').ipcRenderer;
const webviewElem = document.getElementById("webview");

function goTo(assignment, notebook) {
    ipc.send('showAssignment', assignment);
}

function submitNotebook(assignment, notebook, score, attemptsRemaining) {
	webviewElem.send('saveNotebook');
    // ipc.send('submitNotebook', assignment, notebook, score, attemptsRemaining);
}

// When everything is ready, trigger the events without problems
webviewElem.addEventListener('dom-ready', function() {
    webviewElem.send('removeElement', 'header-container');
    webviewElem.send('removeElement', 'menubar');
});