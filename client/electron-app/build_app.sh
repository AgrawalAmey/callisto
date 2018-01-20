#!/bin/bash  
set -x

##################################################################
#  Builds app packages for linux, mac and windows                #
##################################################################


buid_for_linux()
{
    electron-packager . nnfl-app \
        --overwrite --asar --platform=linux \
        --arch=x64 --icon=static/img/icons/512x512.png \
        --overwrite --ignore=conda_installers/Anaconda3-5.0.1-MacOSX-x86_64.sh \
        --ignore=conda_installers/Anaconda3-5.0.1-Windows-x86_64.exe \
        --prune=true --out=release-builds
}

buid_for_mac()
{
    electron-packager . nnfl-app \
        --overwrite --asar --platform=darwin \
        --arch=x64 --icon=static/img/icons/icon.icns \
        --overwrite --ignore=conda_installers/Anaconda3-5.0.1-Linux-x86_64.sh \
        --ignore=conda_installers/Anaconda3-5.0.1-Windows-x86_64.exe \
        --prune=true --out=release-builds
}

buid_for_windows()
{
    electron-packager . nnfl-app \
        --overwrite --asar --platform=win32 \
        --arch=x64 --icon=static/img/icons/icon.ico \
        --overwrite --ignore=conda_installers/Anaconda3-5.0.1-MacOSX-x86_64.sh \
        --ignore=conda_installers/Anaconda3-5.0.1-Linux-x86_64.sh \
        --version-string.CompanyName=CE --version-string.FileDescription=CE \
        --version-string.ProductName="NNFL App" \
        --prune=true --out=release-builds
}

echo "Building for Linux..."
SECONDS=0
buid_for_linux
echo "Linux package built in $SECONDS seconds."

echo "Building for MacOSX..."
buid_for_mac
echo "MacOSX package built in $SECONDS seconds."

echo "Building for Windows..."
buid_for_windows
echo "Windows package built in $SECONDS seconds."
