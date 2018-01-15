const { ipcRenderer } = require('electron')

// Create channel to save user credentials
global.saveUserCreds = (username, password) => {
	var userCreds = {
		username: username,
		password: password
	};
	ipcRenderer.send('saveUserCreds', userCreds);
}

// Create channel to remove user credentials
global.removeUserCreds = () => {
	ipcRenderer.send('removeUserCreds');
}