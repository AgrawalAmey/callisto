const ipc = require('electron').ipcRenderer;

function goBack() {
    ipc.send('showPractice');
}

const webviewElem = document.getElementById("webview");

// When everything is ready, trigger the events without problems
webviewElem.addEventListener('dom-ready', function() {
    webviewElem.send('removeElement', 'header-container')
    webviewElem.send('removeElement', 'menubar')
})