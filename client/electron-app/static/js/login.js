$(function () {
    $("#loginForm").validate({
        rules: {
            username: {
                required: true
            },
            password: {
                required: true
            }
        },
        submitHandler: function (form) {
            console.log(1)
            username = $("#username").val()
            password = $("#password").val()
            session.login(username, password)
        }
    })
})