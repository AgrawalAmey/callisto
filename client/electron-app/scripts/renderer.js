// Load vender scripts
var request = require('request');
const path = require('path');
const ejse = require('ejs-electron');

// Load custom scripts
const remoteServerAddrHandler = require('./remoteServerAddrHandler.js');

function Renderer(mainWindow, session) {
    self = this

    this.mainWindow = mainWindow
    this.session = session

    this.getViewsPath = () => {
        return path.join('file://', __dirname, '../views')
    }

    this.getRemoteServerURL = () => {
        return "http://" + remoteServerAddrHandler.getRemoteServerAddr()
    }

    this.renderIndex = (remoteServerAddr) => {

        var url = this.getRemoteServerURL() + "/login";

        // For the first time case
        if (remoteServerAddr == '') {
            this.renderServerAddrPage(remoteServerAddr, null)
            return;
        }

        request.get(url, function (err, body, res) {
            if (err) {
                this.renderServerAddrPage(remoteServerAddr, 'Cannot connect to remote server')
                return;
            }

            // Save address
            remoteServerAddrHandler.saveRemoteServerAddr(remoteServerAddr, () => {
                // Render login page
                self.renderLoginPage()
            })
        })
    }

    this.renderServerAddrPage = (remoteServerAddr, message) => {
        ejse.data('remoteServerAddrPlaceholder', remoteServerAddr);
        ejse.data('message', message)
        this.mainWindow.loadURL(path.join(this.getViewsPath(), 'remoteAddr.ejs'))
    }

    this.renderLogin = (creds) => {
        console.log(3)
        this.session.login(creds.username, creds.password, (err, resp, body) => {
            console.log(8)
            if (resp.statusCode != 200) this.renderLoginPage(body)
            // Render assignment page
            // this.renderAssignmentsPage()
        })
    }

    this.renderLogout = () => {
        this.session.logout(() => {
            this.mainWindow.close()
        })
    }

    this.renderLoginPage = (message) => {
        ejse.data('message', message)
        this.mainWindow.loadURL(path.join(this.getViewsPath(), 'login.ejs'))
    }

    this.renderAssignmentsPage = (user, assignments) => {
        var url = this.getRemoteServerURL() + "/assignment"
        request = this.session.getRequestHandler()

        this.request(url, (err, resp, body) => {
            if (resp.statusCode != 200) this.renderLoginPage(body)

            var data = JSON.parse(body)
            ejse.data('user', data.user)
            ejse.data('assignments', data.assignments)
            this.mainWindow.loadURL(path.join(this.getViewsPath(), 'assignment.ejs'))
        })
    }
}

module.exports = Renderer