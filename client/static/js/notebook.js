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
    // Show devTools if you want
    //webview.openDevTools();
    // console.log("DOM-Ready, triggering events !");
    
    // // Aler the scripts src of the website from the <webview>
    // webview.send("request");
    
    // // alert-something
    // webview.send("alert-something", "Hey, i'm alerting this.");
    
    // // change-text-element manipulating the DOM
    // webview.send("change-text-element",{
    //     id: "myelementID",
    //     text: "My text"
    // });

    webviewElem.send('removeElement', 'header-container');
    webviewElem.send('removeElement', 'menubar');
});