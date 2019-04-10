# NNFL App

NNFL App is developed to enable to provide a easy solution for conducting courses with Jupyter Notebooks.

Click on the image below for a short tour of the app.

[![Tour Video](https://j.gifs.com/l5EDy7.gif)](https://www.youtube.com/watch?v=fiKaIJcfsAs&feature=youtu.be)


## Why Use NNFL App

### For Students

- NNFL App comes with an electron based desktop client for all major operating systems. On installation the app sets up the Python environment with all the required dependencies for the student.
- All requires binaries are bundled with the app distribution, in-case of limited internet bandwidth students can directly download the app distribution from faster local network.
- Fetch and launch latest assignment notebooks with a single click.
- Single button submission during tests.

### For Course Admins

- No corrupt or ill formated test submissions.
- Easy to integrate with any automated grader.

## Setting Up

### Server

Before proceeding server make sure you have installed MongoDB and the mongo daemon is running.

Once you have setup MongoDB, install npm dependencies.

```
cd server
npm install
```

Launch development server by running,

```
npm start
```

For production use we recommend using [forever](https://github.com/foreverjs/forever).

```
npm install -g forever
forever start ./utils_scripts/foreverConfig.json
```

While bootstrapping the database administrator account can be created as follows,
```
node util_scripts/addAdmin.js
```
The default administrator credentials are "admin:admin".

### Client

To launch the client, we must first install electron. We recommend installing electron globally.

```
npm install -g electron
```

Once electron is installed, proceed to download Anaconda installers. Please note that installers for all supported operating systems is downloaded during this step and consume up to 10GB of memory.

```
cd client
./download_conda.sh
```

The client app can be launched in development mode via,
```
npm start
```

To create a binary for the client first install electron-packager.

```
npm install -g electron-packager
```

To build artifacts simply run,
```
./build_app.sh
```

Note: MacOS artifacts should be created on Mac machines only.