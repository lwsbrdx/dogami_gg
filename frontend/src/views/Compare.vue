<script lang="ts" setup>
import { Ref, ref, watch } from 'vue';
import { main } from '../../wailsjs/go/models';
import SelectDogami from '../components/SelectDogami.vue'
import DogamiDetails from '../components/DogamiDetails.vue'

const leftDogami: Ref<main.Dogami | undefined> = ref()
const rightDogami: Ref<main.Dogami | undefined> = ref()
</script>

<template>
    <h1>Compare</h1>
    <div class="select-dogamis">
        <div class="select-dogamis-left">
            <SelectDogami v-model:model-value="leftDogami" />
        </div>
        <div>
            <p>VS</p>
        </div>
        <div class="select-dogamis-right">
            <SelectDogami v-model:model-value="rightDogami" />
        </div>
    </div>

    <div class="compare-dogamis">
        <div class="compare-dogamis-left">
            <DogamiDetails v-if="leftDogami" :model-value="leftDogami"/>
        </div>
        <div v-if="rightDogami" class="compare-dogamis-right">
            <DogamiDetails v-if="rightDogami" :model-value="rightDogami"/>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.select-dogamis {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
}

.compare-dogamis {
    display: flex;
    flex-direction: row;
    padding-top: 25px;

    &-left, &-right {
        width: 50%;
    }
}
</style>