#!/bin/bash

rm -rf conda_installers
mkdir conda_installers

pushd conda_installers

wget https://repo.anaconda.com/archive/Anaconda3-5.3.1-Linux-x86_64.sh
wget https://repo.anaconda.com/archive/Anaconda3-5.3.1-MacOSX-x86_64.sh
wget https://repo.anaconda.com/archive/Anaconda3-5.3.1-Windows-x86_64.exe

popd
