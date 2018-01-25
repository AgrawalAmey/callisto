var request = require("request")

var config = require("../config")

function SessionHandler() {
    this.login = (username, password) => {
        var j = request.jar()
        this.request = request.defaults({ jar: j })

        var options = {
            method: 'POST',
            url: 'http://' + config.remoteServerAddr +'/login',
            headers:
                {
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded'
                },
            timeout: 500,
            form: { username: username, password: password },
        };

        this.request(options, function (error, response, body) {
            if (error) throw new Error(error);
        });
    }

    this.getRequestHandler = () => {
        return this.request
    }

    this.logout = () => {
        this.request = require('request')
    }
}

module.exports = new SessionHandler()