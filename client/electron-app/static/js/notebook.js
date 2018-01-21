const ipc = require('electron').ipcRenderer;

$(function () {
    function goTo(assignment, notebook) {
        ipc.send('showAssignment', assignment);
    }

    function submitNotebook(assignment, notebook, score, attemptsRemaining) {
        ipc.send('submitNotebook', assignment, notebook, score, attemptsRemaining);
    }
});