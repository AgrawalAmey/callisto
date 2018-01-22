const { ipcRenderer } = require('electron')

function Session() {

    this.login = (username, password) => {
        var creds = {
            username: username,
            password: password
        };

        ipcRenderer.send('login', creds);
    }

    this.logout = () => {
        ipcRenderer.send('logout');
    }
}

global.session = new Session()