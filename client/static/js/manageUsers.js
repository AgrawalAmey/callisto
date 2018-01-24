$('#editUserModal').on('show.bs.modal', function (e) {

    //get data-id attribute of the clicked element
    var i = $(e.relatedTarget).data('id');

    var users = getUsers();

    //populate the textboxes
    $(e.currentTarget).find('h4[name="nameHeader"]').html("Edit " + users[i].name)
    $(e.currentTarget).find('input[name="usernmae"]').val(users[i].username);
    $(e.currentTarget).find('input[name="name"]').val(users[i].name);
});

$('#removeUserModal').on('show.bs.modal', function (e) {

    //get data-id attribute of the clicked element
    var i = $(e.relatedTarget).data('id');

    var users = getUsers();

    //populate the textboxes
    $(e.currentTarget).find('h4[name="nameHeader"]').html("Are you sure you want to remove " + users[i].name)
    $(e.currentTarget).find('input[name="username"]').val(users[i].username)
});

$(function () {
    $("#addUserForm").validate({
        rules: {
            username: {
                required: true
            },
            name: {
                required: true
            },
            password: {
                required: true,
                minlength: 8
            }
        },
        messages: {
            password: {
                required: "This field is required.",
                minlength: "Password should be at least 8 characters long."
            }
        },
        submitHandler: function (form) {
            form.submit();
        }
    });
    $("#editUserForm").validate({
        rules: {
            name: {
                required: true
            },
            password: {
                required: true,
                minlength: 8
            }
        },
        messages: {
            password: {
                required: "This field is required.",
                minlength: "Password should be at least 8 characters long."
            }
        },
        submitHandler: function (form) {
            form.submit();
        }
    })
    $("#removeUserForm").validate({
        rules: {
            username: {
                required: true
            }
        },
        submitHandler: function (form) {
            form.submit();
        }
    })
});
