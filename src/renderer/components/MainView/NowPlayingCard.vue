<template>
    <div id="mobile-box">
        <!-- Card -->
        <div class="card">
            <!-- Card image -->
            <div class="view">
                <img class="card-img-top" v-bind:src="Image" alt="Card image cap" />
            </div>

            <!-- Card content -->
            <div class="card-body text-center">
                <h5 class="h5 font-weight-bold">{{Artist}}</h5>
                <p class="mb-0">{{Song}}</p>

                <vue-slider :min="0" :max="Duration" :tooltip-formatter="progressFormatter" ref="slider"></vue-slider>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ["image", "song", "artist", "duration"],
    computed: {
        Image() {
            return this.image;
        },
        Song() {
            return this.song;
        },
        Artist() {
            return this.artist;
        },
        Duration() {
            return this.duration;
        }
    },
    methods: {
        UpdateProgress(progress) {
            this.progress = progress;
            this.$nextTick(() => {
                this.$refs.slider.setValue(this.progress);
            });
        }
    },
    data() {
        return {
            electron: process.versions.electron,
            node: process.versions.node,
            path: this.$route.path,
            platform: require("os").platform(),
            vue: require("vue/package.json").version,
            progress: 0,
            progressFormatter: v => {
                let seconds = (v/1000);
                let minutes = Math.floor(seconds/60);
                seconds = Math.floor(seconds - (minutes * 60));
                seconds = (seconds < 10) ? ("0" + seconds) : seconds;
                minutes = (minutes < 10) ? ("0" + minutes) : minutes;
                return `${minutes}:${seconds}`
            }
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

.card h5 a {
    color: #0d47a1;
}
.card h5 a:hover {
    color: #072f6b;
}

#pButton {
    float: left;
}

#timeline {
    width: 90%;
    height: 2px;
    margin-top: 20px;
    margin-left: 10px;
    float: left;
    -webkit-border-radius: 15px;
    border-radius: 15px;
    background: rgba(0, 0, 0, 0.3);
}

#pButton {
    margin-top: 12px;
    cursor: pointer;
}

#playhead {
    width: 8px;
    height: 8px;
    -webkit-border-radius: 50%;
    border-radius: 50%;
    margin-top: -3px;
    background: black;
    cursor: pointer;
}
</style>
