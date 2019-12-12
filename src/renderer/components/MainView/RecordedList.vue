<template>
    <ul id="recorded-list" class="list-group">
        <li v-for="song in recorded" class="list-group-item">{{song.artist}} - {{song.name}}</li>
    </ul>
</template>

<script>
export default {
    methods: {
        AddSong(artist, name)
        {
            this.recorded.push({artist: artist, name: name});
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
</style>
