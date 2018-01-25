const ipc = require('electron').ipcRenderer;

$(function () {
    $("#serverForm").validate({
        rules: {
            remoteServerAddr: {
                required: true
            }
        },
        submitHandler: function (form) {
            ipc.send('serverBtn-click', $('#remoteServerAddr').val());
        }
    });
});