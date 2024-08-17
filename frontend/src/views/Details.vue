<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue';
import { main } from '../../wailsjs/go/models';
import DogamiDetails from '../components/DogamiDetails.vue';
import { FindDogami, GetDogami, UpdateDogami } from '../../wailsjs/go/main/DogamiService';
import { useRoute } from 'vue-router';

const dogami: Ref<main.Dogami | undefined> = ref()
const route = useRoute()
const isUpdateDisabled = ref(false)

onMounted(() => {
    FindDogami(convertIdToNumber(route.params.id))
    .then((value) => {
        dogami.value = value
    })
})

function convertIdToNumber(id: string | string[]): number {
    if (Array.isArray(id)) {
        id = id[0]
    } 

    let temp = Number.parseInt(id)
    if (Number.isNaN(temp)) {
        throw 'id is not a number'
    }

    return temp
}

function startUpdate() {
    if (dogami.value === undefined) return

    isUpdateDisabled.value = true;
    UpdateDogami(dogami.value.nftId)
    .then((updatedDogami) => {
        dogami.value = updatedDogami
        isUpdateDisabled.value = false
    })
}
</script>

<template>
    <DogamiDetails v-if="dogami" :model-value="dogami" />
    <button v-if="dogami" class="btn-update-dogami" :disabled="isUpdateDisabled" @click="startUpdate">
        Update Dogami
    </button>
</template>

<style lang="scss" scoped>
.btn-update-dogami {
    margin-top: 25px;
}
</style>