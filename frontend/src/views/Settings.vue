<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { DownloadAllDogamis } from "../../wailsjs/go/main/DogamiService"
import { DogamiDownloadStates } from "../classes/helper";
import { dogamisDownloadStateStore } from "../store";

const updateDogamisState = dogamisDownloadStateStore;
const updatingDogamis = ref(false)

onMounted(() => handleDogamisDownloadState(updateDogamisState.state))

watch(
    () => updateDogamisState.state,
    handleDogamisDownloadState
)

function handleDogamisDownloadState(state: DogamiDownloadStates) {
    switch (state) {
        case DogamiDownloadStates.Started:
        case DogamiDownloadStates.InProgress:
            updatingDogamis.value = true
            break;
        case DogamiDownloadStates.Done:
            updatingDogamis.value = false
            break;
    }
}
</script>

<template>
    <h1>Settings</h1>
    <div class="settings-container">
        <div class="settings-element">
            <h2>Update all dogamis</h2>
            <button :disabled="updatingDogamis" @click="DownloadAllDogamis">
                Start
            </button>
        </div>
    </div>
</template>


<style lang="scss" scoped>
.settings-container {
    display: flex;
    flex-direction: column;
    row-gap: 25px;

    & .settings-element {
        display: flex;
        flex-direction: column;
        align-items: start;
    }
}
</style>