import { parse } from 'url'
import axios from 'axios'
import qs from 'qs'

const AUTHORIZATION_URL = 'https://accounts.spotify.com/authorize/'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const CLIENT_KEY = "140f445f97a3483c90a5023643bd1ab4";
const CLIENT_SECRET = "b429f164f6b14f438e8e55d280450b29";
let REDIRECT_URI = "";
let s_access_tokens = null;

export default class OAuth
{
    static Authorize(browser, return_uri)
    {
        REDIRECT_URI = return_uri + "/";
        return new Promise((resolve, reject) =>
        {
            const urlParams = {
                response_type: 'code',
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_KEY,
                scope: "app-remote-control playlist-read-private " +
                    "playlist-read-collaborative playlist-modify-public playlist-modify-private " +
                    "user-library-read user-library-modify " +
                    "user-read-playback-state user-read-currently-playing " +
                    "user-modify-playback-state"
            }
            const authUrl = `${AUTHORIZATION_URL}?${qs.stringify(urlParams)}`

            function handleNavigation(url)
            {
                const query = parse(url, true).query
                if (query)
                {
                    if (query.error)
                    {
                        reject(new Error(`There was an error: ${query.error}`))
                    } else if (query.code)
                    {
                        // Login is complete
                        browser.removeAllListeners('closed')

                        // This is the authorization code we need to request tokens
                        resolve(query.code)
                    }
                }
            };

            browser.on('closed', () =>
            {
                throw new Error('Auth window was closed by user')
            })

            browser.webContents.on("did-redirect-navigation", (event, url) => {
                if (url.includes(REDIRECT_URI))
                {
                    handleNavigation(url)
                }
            });

            browser.webContents.on('will-navigate', (event, url) =>
            {
                if (url.includes(REDIRECT_URI))
                {
                    handleNavigation(url)
                }
            })

            browser.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) =>
            {
                if (newUrl.includes(REDIRECT_URI))
                {
                    handleNavigation(newUrl)
                }
            })

            browser.loadURL(authUrl)
        });
    }

    static FetchAccessTokens(code)
    {
        return new Promise((resolve, reject) =>
        {
            let data = `${CLIENT_KEY}:${CLIENT_SECRET}`;
            let buff = new Buffer(data);
            let base64data = buff.toString('base64');
            axios.post(TOKEN_URL, qs.stringify({
                code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            }), {
                headers: {
                    "Authorization": "Basic " + base64data,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }).then(response => {
                s_access_tokens = response.data;
                resolve(response.data);
            }).catch(error => {
                reject(new Error(`Token response failed: ${error}`));
            });
        });
    }

    static FetchRefreshToken()
    {
        if (s_access_tokens === null)
        {
            console.log("Dont have any access tokens yet");
            return;
        }

        return new Promise((resolve, reject) =>
        {
            let data = `${CLIENT_KEY}:${CLIENT_SECRET}`;
            let buff = new Buffer(data);
            let base64data = buff.toString('base64');
            axios.post(TOKEN_URL, qs.stringify({
                grant_type: 'refresh_token',
                refresh_token: s_access_tokens.refresh_token
            }), {
                headers: {
                    "Authorization": "Basic " + base64data,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }).then(response => {
                s_access_tokens.access_token = response.data.access_token;
                resolve(response.data);
            }).catch(error => {
                reject(new Error(`Token response failed: ${error}`));
            });
        });
    }

    static AccessToken()
    {
        if (s_access_tokens === null)
        {
            return null;
        }
        return s_access_tokens.access_token;
    }

    static RefreshToken()
    {
        if (s_access_tokens === null)
        {
            throw new Error("Access token not granted");
        }
        return s_access_tokens.refresh_token;
    }
}