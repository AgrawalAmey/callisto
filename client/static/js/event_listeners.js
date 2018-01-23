$('#logoutBtn').click(function () {
	session.logout()
	window.location.replace('/logout');
});