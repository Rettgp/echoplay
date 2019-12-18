<template>
    <div id="wrapper">
        <div
            class="alert alert-danger"
            role="alert"
            v-if="no_lame"
        >EchoPlay cannot find LAME. Please install LAME on your system.</div>
        <now-playing-card id="playingCard" ref="nowPlaying"></now-playing-card>
        <button
            id="recordButton"
            v-on:click="ToggleRecord"
            type="button"
            class="btn btn-success btn-circle btn-xl"
        >
            <font-awesome-icon icon="microphone" size="3x" />
        </button>
        <recorded-list ref="recorded_list" id="recordedList"></recorded-list>
    </div>
</template>

<script>
import { BrowserView } from "electron";
import NowPlayingCard from "./MainView/NowPlayingCard";
import RecordedList from "./MainView/RecordedList";
import OAuth from "oauth/OAuth";
import { Lame } from "node-lame";
var PATH = require("path");
var SpotifyWebApi = require("spotify-web-api-node");
var portAudio = require("naudiodon");
var HASBIN = require("hasbin");
const Fs = require("fs");
var spotifyApi = new SpotifyWebApi();
console.log(portAudio.getDevices())
console.log(portAudio.getHostAPIs())

let access_token = null;
let AudioIo = null;

export default {
    name: "main-view",
    components: { NowPlayingCard, RecordedList },
    data() {
        return {
            playing_song: null,
            playing_artist: null,
            recording: false,
            no_lame: !HASBIN.sync("lame"),
            is_ad: false,
            running: false
        };
    },
    methods: {
        open(link) {
            this.$electron.shell.openExternal(link);
        },
        StartRecording() {
            if (!this.recording && !this.is_ad) {
                AudioIo = new portAudio.AudioIO({
                    inOptions: {
                        channelCount: 2,
                        sampleFormat: portAudio.SampleFormat16Bit,
                        sampleRate: 44100,
                        deviceId: -1 // Use -1 or omit the deviceId to select the default device
                    }
                });
                // Create a write stream to write out to a raw audio file
                let AudioWriteStream = Fs.createWriteStream("rawAudio.raw");
                AudioIo.pipe(AudioWriteStream);
                AudioIo.start();
                this.recording = true;
            }
        },
        StopRecording() {
            if (this.recording) {
                AudioIo.quit();
                this.recording = false;
            }
        },
        EncodeLastSong(artist, song) {
            return new Promise((resolve, reject) => {
                if (!Fs.existsSync("rawAudio.raw")) {
                    resolve();
                }
                // TODO (Garrett): Fix output path
                let Encoder = new Lame({
                    output: `audio-output/${artist}-${song}.mp3`,
                    bitrate: 192
                });
                Encoder.setFile("rawAudio.raw");
                Encoder.encode()
                    .then(() => {
                        this.$refs.recorded_list.AddSong(artist, song);
                        Fs.unlinkSync("rawAudio.raw");
                        resolve();
                    })
                    .catch(error => {
                        console.error("Encoding Error!");
                        throw new Error(error);
                    });
            });
        },
        ToggleSpotify() {
            this.$electron.ipcRenderer.send("spotify-pauseplay");
        },
        UpdateSongData() {
            if (access_token !== null) {
                spotifyApi.getMyCurrentPlaybackState({}).then(
                    data => {
                        // Output items
                        if (data.body.item !== undefined) {
                            this.is_ad =
                                data.body.currently_playing_type === "ad";
                            let song_name = this.is_ad
                                ? "ad"
                                : data.body.item.name;
                            let artist = this.is_ad
                                ? "ad"
                                : data.body.item.artists[0].name;
                            let album = this.is_ad
                                ? "https://developer.spotify.com/assets/branding-guidelines/icon3@2x.png"
                                : data.body.item.album.images[1].url;

                            if (
                                this.running &&
                                this.playing_song !== null &&
                                song_name !== this.playing_song
                            ) {
                                this.StopRecording();
                                this.ToggleSpotify();
                                this.EncodeLastSong(
                                    this.playing_artist,
                                    this.playing_song
                                ).then(() => {
                                    this.StartRecording();
                                    this.ToggleSpotify();
                                });
                            }

                            this.playing_song = song_name;
                            this.playing_artist = artist;
                            this.$refs.nowPlaying.Update(
                                this.playing_artist,
                                this.playing_song,
                                album
                            );
                        }
                    },
                    function(err) {
                        console.log("Something went wrong!", err);
                    }
                );
            }
        },
        ToggleRecord() {
            if (!HASBIN.sync("lame")) {
                this.no_lame = true;
                return;
            }

            this.no_lame = false;
            this.running = !this.running;
            if (!this.recording && !this.is_ad) {
                this.StartRecording();
            } else {
                this.StopRecording();
            }
            this.ToggleSpotify();
        }
    },
    mounted: function() {
        this.$electron.ipcRenderer.on("new_access_token", (event, token) => {
            access_token = token;
            spotifyApi.setAccessToken(access_token);
        });
        setInterval(this.UpdateSongData, 500);
    },
    beforeDestroy: function() {
        AudioIo.quit();
    }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

#wrapper {
    background: #23272a;

    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

.alert {
    position: fixed;
    left: 0;
    top: 0;
}

#recordedList {
    display: inline-block;
    vertical-align: top;
    width: 44%;
    height: 100%;
    overflow-y: auto;
}

#playingCard {
    display: inline-block;
    vertical-align: top;
    width: 55%;
    height: 100%;
}

#recordButton {
    position: fixed;
    right: 0;
    bottom: 0;
    z-index: 100;
}

.btn-circle.btn-xl {
    width: 70px;
    height: 70px;
    padding: 10px 16px;
    border-radius: 35px;
    font-size: 12px;
    text-align: center;
}
</style>
