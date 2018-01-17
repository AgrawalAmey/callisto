const config = require('../config')
var request = require("request")


function SessionHandler() {
    var j = request.jar()
    
    this.request = request.defaults({
        jar: j,
        followAllRedirects: true,
        baseUrl:  "http://" + config.remoteServerAddr
    })
    

    // this.request = request.defaults({
    //     jar: j
    //  })

    this.login = (username, password, callback) => {
        var options = {
            method: 'POST',
            url: "login",
            headers:
                {
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded'
                },
            form: { username: username, password: password }
        }
        console.log(7)
        this.request(options, callback)
    }

    this.getRequestHandler = () => {
        return this.request
    }

    this.logout = (callback) => {
        this.request("http://" + config.remoteServerAddr + "/logout", callback)
    }
}

module.exports = SessionHandler