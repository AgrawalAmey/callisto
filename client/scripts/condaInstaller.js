const { app } = require('electron')
const config = require('../config')
const { exec, execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const rimraf = require('rimraf')

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

    this.getNbgraderPackagesPath = () => {
        var basePath = path.join(__dirname, '..', 'conda_installers')
        
        // The order of this array decides installation order
        var packageTars = [
                "python-editor-1.0.3.tar.gz",
                "Mako-1.0.7.tar.gz",
                "alembic-0.9.7.tar.gz",
                "nbgrader-0.5.4.tar.gz"
            ]
        
        var packagesTarsPaths = packageTars.map((packageTar) => {
            return path.join(basePath, packageTar)
        })

        return packagesTarsPaths
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
            if (err) {
                rimraf(this.getInstallationPath(), () => {
                    callback(err)
                })
                return
            }

            if(this.platform == 'linux' || this.platform == 'darwin') {
                // this.installNbgrader(callback)
                callback()
            } else {
                this.waitTillWindowsInstallation(callback)
            }
        })
    }

    this.waitTillWindowsInstallation = (callback, startTime) => {
        startTime = startTime || new Date()

        if (this.isInstalled()){
            // this.installNbgrader(callback)
            callback()
        } else if (new Date() - startTime > config.windowsInstallationTimeOut) {
            rimraf(this.getInstallationPath(), () => {
                callback(new Error('Installation TimeOut.'))
            })
        } else {
            setTimeout(waitTillWindowsInstallation, 10000, callback, startTime)
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

    this.installNbgrader = (callback) => {
        var installationPath = this.getInstallationPath()
        var nbgraderPackagesPath = this.getNbgraderPackagesPath()
    
        if (this.platform == 'win32') {
            var pipPath = path.join(installationPath, 'Scripts', 'pip.exe')
        } else {
            var pipPath = path.join(installationPath, 'bin', 'pip')
        }

        var options = {
            windowsHide: true,
            maxBuffer: 1000 * 1024
        }

        cmds = nbgraderPackagesPath.map((packagePath) => {
            return pipPath + " install " + packagePath
        })

        this.execSequentially(cmds, callback)
    }

    this.execSequentially = (cmds, callback) => {
        if (cmds.length == 0) {
            callback()
            return
        }
        
        var cmd = cmds.splice(0, 1)[0]
        
        var options = {
            windowsHide: true,
            maxBuffer: 1000 * 1024
        }

        exec(cmd, options, (err, stdout, stderr) => {
            if (err) {
                callback(err)
                return
            }

            this.execSequentially(cmds, callback)
        })
    }
}

module.exports = new CondaInstaller()