const ipc = require('electron').ipcRenderer;

$(function () {
    function goTo(assignment, notebook) {
        ipc.send('showAssignment', assignment);
    }

    function submitNotebook(assignment, notebook) {
        ipc.send('submitNotebook', assignment, notebook);
    }
});