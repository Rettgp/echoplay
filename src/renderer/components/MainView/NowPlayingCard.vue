<template>
    <div id="mobile-box">
        <!-- Card -->
        <div class="card">
            <!-- Card image -->
            <div class="view">
                <img class="card-img-top" v-bind:src="image" alt="Card image cap" />
            </div>

            <!-- Card content -->
            <div class="card-body text-center">
                <h5 class="h5 font-weight-bold">{{artist}}</h5>
                <p class="mb-0">{{song}}</p>
            </div>
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

#mobile-box {
    width: 280px;
    margin: auto;
}

.gradient-card {
    /* FF3.6+ */
    background: -webkit-gradient(
        linear,
        left top,
        left bottom,
        color-stop(0%, rgba(220, 66, 37, 0.5)),
        color-stop(100%, rgba(0, 47, 75, 0.5))
    );
    /* Chrome,Safari4+ */
    background: -webkit-linear-gradient(
        top,
        rgba(0, 47, 75, 0.5) 0%,
        rgba(220, 66, 37, 0.5) 100%
    );
    /* Chrome10+,Safari5.1+ */
    background: -o-linear-gradient(
        top,
        rgba(0, 47, 75, 0.5) 0%,
        rgba(220, 66, 37, 0.5) 100%
    );
    /* Opera 11.10+ */
    /* IE10+ */
    background: -webkit-gradient(
        linear,
        left top,
        left bottom,
        from(rgba(0, 47, 75, 0.5)),
        to(rgba(220, 66, 37, 0.5))
    );
    background: linear-gradient(
        to bottom,
        rgba(0, 47, 75, 0.5) 0%,
        rgba(220, 66, 37, 0.5) 100%
    );
    /* W3C */
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#002f4b', endColorstr='#00000000', GradientType=0);
    /* IE6-9 */
}

.card {
    -webkit-border-radius: 10px;
    border-radius: 10px;
}

.card .view {
    -webkit-border-top-left-radius: 10px;
    border-top-left-radius: 10px;
    -webkit-border-top-right-radius: 10px;
    border-top-right-radius: 10px;
}
</style>
