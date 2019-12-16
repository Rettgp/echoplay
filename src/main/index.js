import { app, BrowserWindow, ipcMain } from 'electron'
import OAuth from "oauth/OAuth"

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development')
{
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow = null;
let spotifyWindow = null;
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`
const redirect_uri = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `http://localhost:9080/oauth`;


function createWindow()
{
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        height: 563,
        useContentSize: true,
        width: 1000
    })


    mainWindow.on('closed', () =>
    {
        mainWindow = null
    })

    OAuth.Authorize(mainWindow, winURL, redirect_uri).then(code =>
    {
        OAuth.FetchAccessTokens(code).then(tokens =>
        {
            if (process.env.NODE_ENV !== "development")
            {
                mainWindow.loadURL(winURL);
            }
            setInterval(OAuth.FetchRefreshToken, 600000);
            createSpotifyWindow();
        });
    });
}

function createSpotifyWindow()
{
    // EXPERIMENTAL
    // let view = new BrowserView();
    // mainWindow.addBrowserView(view)
    // view.setBounds({ x: 0, y: 0, width: 300, height: 300 })
    // view.webContents.loadURL("https://open.spotify.com/")

    spotifyWindow = new BrowserWindow({
        webPreferences: {
            plugins: true
        },
        height: 563,
        useContentSize: true,
        width: 1000
    })
    spotifyWindow.loadURL("https://open.spotify.com/")
    spotifyWindow.on('closed', () =>
    {
        spotifyWindow = null
    })
}

setInterval(function ()
{
    if (mainWindow !== null)
    {
        mainWindow.webContents.send("new_access_token", OAuth.AccessToken());
    }
}, 1000);

app.on('ready', createWindow);

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin')
    {
        app.quit()
    }
})

app.on('activate', () =>
{
    if (mainWindow === null)
    {
        createWindow()
    }
})

ipcMain.on("spotify-pauseplay", (event, arg) =>
{
    if (spotifyWindow !== null)
    {
        spotifyWindow.webContents.sendInputEvent({ keyCode: 'Space', type: 'keyDown' });
        spotifyWindow.webContents.sendInputEvent({ keyCode: 'Space', type: 'keyUp' });
    }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
