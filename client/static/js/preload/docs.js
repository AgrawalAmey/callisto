const remote = require('electron').remote;


function Docs() {
    this.openInNewWindow = (url) => {
        const BrowserWindow = remote.BrowserWindow
        var win = new BrowserWindow({ width: 800, height: 600 })
        win.loadURL(url)
    }
}

global.docs = new Docs()