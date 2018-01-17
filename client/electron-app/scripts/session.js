// Custom scripts
const Creds = require('./creds.js')
const SessionHandler = require('./sessionHandler.js')

function Session() {
    this.creds = new Creds()
    this.sessionHandler = new SessionHandler()

    this.login = (username, password, callback) => {
        console.log(5)
        this.creds.login(username, password, () => {
            console.log(6)
            this.sessionHandler.login(username, password, callback)
        })
    }

    this.logout = (callback) => {
        this.creds.logout()
        this.sessionHandler.logout(callback)
    }

    this.getRequestHandler = () => {
        return this.sessionHandler.getRequestHandler()
    }
}

module.exports = Session