<template>
    <div class="card">
        <div class="view">
            <img class="card-img-top" v-bind:src="image" alt="Card image cap" />
        </div>

        <div class="text-center">
            <h5 class="h5 font-weight-bold">{{artist}}</h5>
            <p class="mb-0">{{song}}</p>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        Duration() {
            return this.duration;
        }
    },
    methods: {
        Update(artist, song, image) {
            this.artist = artist;
            this.song = song;
            this.image = image;
        }
    },
    data() {
        return {
            song: "",
            artist: "",
            image: "https://developer.spotify.com/assets/branding-guidelines/icon3@2x.png",
        };
    }
};
</script>

<style scoped>

h5 {
    font-size: 5vh;
    color: white;
}

p {
    font-size: 3vh;
    color: white;
}

.card {
    border: 1px solid #7289da;
    background:#23272a;
    border: 0;
}

.card .view {
    -webkit-border-top-left-radius: 10px;
    border-top-left-radius: 10px;
    -webkit-border-top-right-radius: 10px;
    border-top-right-radius: 10px;
    height: 85%;
    padding-bottom: 0.5em;
}

img {
    height: 100%;
}
</style>
