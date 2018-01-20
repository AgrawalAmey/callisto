const { app } = require('electron')
const { exec } = require('child_process');
const fs = require('fs')
const os = require('os')
const path = require('path')

function  CondaInstaller() {
    this.platform = os.platform()

    this.getInstallationPath = () => {
        var userDataPath = app.getPath('userData')
        return path.join(userDataPath, 'conda_env')        
    }

    this.getInstallerPath = () => {
        var basePath = path.join(__dirname, '..','conda_installers')
        
        switch (this.platform) {
            case 'linux':
                var installtionFile = 'Anaconda3-5.0.1-Linux-x86_64.sh'
                break;
            case 'darwin':
                var installtionFile = 'Anaconda3-5.0.1-MacOSX-x86_64.sh'
                break;
            case 'win32':
                var installtionFile = 'Anaconda3-5.0.1-Windows-x86_64.exe'
                break;
            default:
                throw new Error("Unsupported operating system.")
                break;
        }
        
        return path.join(basePath, installtionFile)
    }

    this.getInstallationCmd = () => {
        var installerPath = this.getInstallerPath()
        var installationPath = this.getInstallationPath()

        switch (platform) {
            case 'linux':
                var cmd = '${installerPath} -bfp ${installationPath}'
                break;
            case 'darwin':
                var cmd = '${installerPath} -bfp ${installationPath}'
                break;
            case 'win32':
                var cmd = '${installerPath} /S /D=${installationPath}'
                break;
            default:
                throw new Error("Unsupported operating system.")
                break;
        }

        return cmd
    }

    this.install = (callback) => {
        var cmd = this.getInstallationCmd()

        var options = {
            windowsHide: true,
            maxBuffer: 1000 * 1024
        }

        exec(cmd, options, (err, stdout, stderr) => {
            if (err) {
                throw err;
                // node couldn't execute the command
                return;
            }

            if(this.platform == 'linux' || this.platform == 'darwin') {
                callback()
            } else {
                this.waitTillWindowsInstallation(callback)
                setTimeout(myFunc, 1500, 'funky');
                fs.existsSync(credsPath)
            }
        });
    }

    this.waitTillWindowsInstallation = (callback) => {
        if (this.isInstalled()){
            callback()
        } else {
            setTimeout(waitTillWindowsInstallation, 10000, callback)
        }
    }

    this.isInstalled = () => {
        var installationPath = this.getInstallationPath()
        
        if(this.platform == 'linux' || this.platform == 'darwin') {
            var pyFilePath = path.join(installationPath, 'bin','python')
        } else {
            var pyFilePath = path.join(installationPath, 'python.exe')
        }
        
        return fs.existsSync(pyFilePath)
    }
}

module.exports = new CondaInstaller()