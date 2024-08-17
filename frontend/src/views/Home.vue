<script setup lang="ts">
import { Ref, ref, watch } from 'vue';
import SelectDogami from '../components/SelectDogami.vue';
import { main } from '../../wailsjs/go/models';

const dogami: Ref<main.Dogami|undefined> = ref()

watch(dogami, (value) => console.log(value))
</script>

<template>
    <div id="content">
        <h1>DOGAMI.GG</h1>
        <SelectDogami v-model:model-value="dogami"/>
        <RouterLink v-if="dogami" class="link-button" :to="`/dogami/${dogami.nftId}`">
            See Dogami details
        </RouterLink>
    </div>
</template>

<style lang="scss" scoped>
#content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
}
</style>