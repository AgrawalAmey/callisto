// Custom scripts
const creds = require('./creds.js')
const sessionHandler = require('./sessionHandler.js')

function Session() {
    this.login = (username, password) => {
        creds.login(username, password)
        sessionHandler.login(username, password)
    }

    this.logout = () => {
        creds.logout()
        sessionHandler.logout()
    }
}

module.exports = Session