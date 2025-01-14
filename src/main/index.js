import { app, BrowserWindow, ipcMain } from 'electron'
import OAuth from "oauth/OAuth"
let FS = require("fs");
let Path = require("path");

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development')
{
    global.__static = Path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}
else
{
    // Copy Lame resource to resources for DEV environment
    FS.copyFile(Path.join(__dirname, "../../lame.exe"), Path.join(process.resourcesPath, "lame.exe"), (err) =>
    {
        if (err) {
            console.error("Unable to copy resource!!");
            console.log(err);
        }
    });
}

if (process.platform === "win32")
{
    process.env.PATH += ";" + process.resourcesPath;
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
        x: 0,
        y: 0,
        height: 500,
        useContentSize: true,
        width: 750
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
        x: 750,
        y: 0,
        height: 500,
        useContentSize: true,
        width: 750
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
