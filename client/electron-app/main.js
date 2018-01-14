const electron = require('electron');
const ejse = require('ejs-electron').options('debug', false);
const path = require('path');
const request = require('request');
const url = require('url');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const ipc = electron.ipcMain;

// Load config file
var config = require('./config');
var remoteServerAddr = 'http://' + config.remoteServer.host + ':' + config.remoteServer.port;
ejse.data('remoteServerAddrPlaceholder', config.remoteServer.host + ':' + config.remoteServer.port);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  mainWindow.maximize();

  request.get(remoteServerAddr+"/login", function(err, body, res) {
    if(err) {
      // console.log(err);
      ejse.data('message', 'Cannot connect to remote server');
      mainWindow.loadURL(path.join('file://', __dirname, 'views', 'remoteAddr.ejs'));
    } else {
      ejse.data('remoteServerAddr', "http://localhost:19350/notebooks/grabage_collection/Simple%20pdf%20model.ipynb");
      mainWindow.loadURL(path.join('file://', __dirname, 'views', 'webview.ejs'));
    }
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipc.on('serverBtn-click', function(event, remoteServerAddrArg) {
  console.log('hi');
  var remoteServerAddr = "http://" + remoteServerAddrArg;
  request.get(remoteServerAddr, function(err, body, res) {
    if(err) {
      // console.log(err);
      ejse.data('remoteServerAddrPlaceholder', remoteServerAddrArg);
      ejse.data('message', 'Cannot connect to remote server');
      mainWindow.loadURL(path.join('file://', __dirname, 'views', 'remoteAddr.ejs'));
    } else {
      ejse.data('remoteServerAddr', remoteServerAddr);
      mainWindow.loadURL(path.join('file://', __dirname, 'views', 'webview.ejs'));
    }
  });
  // ejse.data('message', 'Cannot connect to remote server sbkjasbjkcb');
      // mainWindow.loadURL(path.join('file://', __dirname, 'views', 'remoteAddr.ejs'));
})
