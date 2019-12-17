<template>
    <ul id="recorded-list" class="list-group dark-mode">
        <li
            v-for="song in recorded"
            class="list-group-item dark-mode dark-mode-item"
        >{{song.artist}} - {{song.name}}<font-awesome-icon style="float: right;" icon="check"/></li>
    </ul>
</template>

<script>
export default {
    methods: {
        AddSong(artist, name) {
            this.recorded.push({ artist: artist, name: name });
        }
    },
    data() {
        return {
            recorded: []
        };
    }
};
</script>

<style scoped>
.dark-mode {
    background-color: #2c2f33;
    font-color: white;
}

.dark-mode-item {
    color: white;
    border-bottom: 2px solid	#7289da;
}

li {
    font-size: 0.8em;
}
</style>

