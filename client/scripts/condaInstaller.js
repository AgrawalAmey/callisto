const { app } = require('electron')
const { exec } = require('child_process');
const fs = require('fs')
const os = require('os')
const path = require('path')

function  CondaInstaller() {
    this.platform = os.platform()

    this.getInstallationPath = () => {
        var homeDir = app.getPath('home')

        switch (this.platform) {
            case 'linux':
                var basePath = path.join(homeDir, 'nnfl-app')
                break;
            case 'darwin':
                var basePath = path.join(homeDir, 'nnfl-app')
                break;
            case 'win32':
                var basePath = path.join('C:', 'programData', 'nnfl-app')
                break;
            default:
                throw new Error("Unsupported operating system.")
                break;
        }
        
        return path.join(basePath, 'conda_env')
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

        switch (this.platform) {
            case 'linux':
                var cmd = installerPath + ' -bfp ' + installationPath
                break;
            case 'darwin':
                var cmd = installerPath + ' -bfp ' + installationPath
                break;
            case 'win32':
                var cmd = installerPath + ' /S /D=' + installationPath
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
            if (err) throw err

            if(this.platform == 'linux' || this.platform == 'darwin') {
                callback(err)
            } else {
                this.waitTillWindowsInstallation(() => {
                    callback(err)
                })
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
        console.log(installationPath)

        if(this.platform == 'linux' || this.platform == 'darwin') {
            var pyFilePath = path.join(installationPath, 'bin','python')
        } else {
            var pyFilePath = path.join(installationPath, 'python.exe')
        }
        
        return fs.existsSync(pyFilePath)
    }
}

module.exports = new CondaInstaller()