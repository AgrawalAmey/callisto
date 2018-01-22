// Load vender libraries
const electron = require('electron')
const ejse = require('ejs-electron')
const path = require('path')
const request = require('request')
const url = require('url')

// Load custom scripts
const ipcChannels = require('./scripts/ipcChannels')
const Renderer = require('./scripts/renderer')
const remoteServerAddrHandler = require('./scripts/remoteServerAddrHandler')
const Session = require('./scripts/session')

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800, 
        height: 600,
        icon: path.join(__dirname, 'static/img/icons/1024x1024.png')
    });

    mainWindow.maximize();


    renderer = new Renderer(mainWindow)
    session = new Session()

    // Set event handlers
    ipcChannels.setChannels(renderer, session)

    renderer.render()

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        session.logout()
    })

    // To ensure that only one instance of works at time
    var shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
        // Someone tried to run a second instance, we should focus our window.
        if (myWindow) {
            if (myWindow.isMinimized()) myWindow.restore();
            myWindow.focus();
        }
    });

    if (shouldQuit) {
        app.quit();
        return;
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

