const path = require('path')
const PDFWindow = require('electron-pdf-window')
const remote = require('electron').remote

function Docs() {
    this.openInNewWindow = (url) => {
        var options = {
                width: 800,
                height: 600
            }
        
        const BrowserWindow = remote.BrowserWindow
        var win = new BrowserWindow(options)

        if (url.split('.').pop() == "pdf") {
            PDFWindow.addSupport(win)
        }
        
        win.loadURL(url)
    }
}

global.docs = new Docs()