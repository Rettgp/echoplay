<template>
    <div id="wrapper">
        <now-playing-card ref="nowPlaying"></now-playing-card>
        <button v-on:click="ToggleRecord" type="button" class="btn btn-success btn-circle btn-xl">
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
const Fs = require("fs");
var spotifyApi = new SpotifyWebApi();

let access_token = null;
let AudioIo = null;

export default {
    name: "main-view",
    components: { NowPlayingCard, RecordedList },
    data() {
        return {
            playing_song: null,
            playing_artist: null,
            recording: false
        };
    },
    methods: {
        open(link) {
            this.$electron.shell.openExternal(link);
        },
        UpdateSongData() {
            if (access_token !== null) {
                spotifyApi.getMyCurrentPlaybackState({}).then(
                    data => {
                        // Output items
                        if (data.body.item !== undefined) {
                            this.playing_song = data.body.item.name;
                            this.playing_artist =
                                data.body.item.artists[0].name;
                            this.$refs.nowPlaying.Update(
                                this.playing_artist,
                                this.playing_song,
                                data.body.item.album.images[1].url
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
            this.recording = !this.recording;
            if (this.recording) {
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

                this.$electron.ipcRenderer.send("spotify-pauseplay");
            } else {
                this.$electron.ipcRenderer.send("spotify-pauseplay");
                AudioIo.quit();

                this.$refs.recorded_list.AddSong(
                    this.playing_artist,
                    this.playing_song
                );

                // TODO (Garrett): Fix output path
                let Encoder = new Lame({
                    output: `audio-output/${this.playing_artist}-${this.playing_song}.mp3`,
                    bitrate: 192
                }, PATH.join(process.resourcesPath, "lame"));
                Encoder.setFile("rawAudio.raw");
                Encoder.encode()
                    .then(() => {})
                    .catch(error => {
                        console.error("Encoding Error!");
                        throw new Error(error);
                    });
            }
        }
    },
    mounted: function() {
        this.$electron.ipcRenderer.on("new_access_token", (event, token) => {
            access_token = token;
            spotifyApi.setAccessToken(access_token);
        });
        setInterval(this.UpdateSongData, 1000);
    },
    beforeDestroy: function() {
        AudioIo.quit();
    }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

#wrapper {
    background: radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, 0.9) 100%
    );
    height: 100%;
    width: 100%;
}

#recordedList {
    position: fixed;
    right: 0;
    top: 0;
    width: 8em;
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
