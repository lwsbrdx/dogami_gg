<script setup lang="ts">
import { nextTick, Ref, ref, watch } from 'vue';
import { main } from '../../wailsjs/go/models'
import { SearchDogami } from '../../wailsjs/go/main/DogamiService';
import { DogamiHelper } from '../classes/helper';

const selectedDogami = defineModel({
    type: main.Dogami
})

const search = ref("");
const selectDiv = ref(null);
const searchInput: Ref<EventTarget|null> = ref(null);
const dogamis: Ref<main.Dogami[]> = ref([]);
const isOpen = ref(false);

watch(search, async (newValue) => {
    if (newValue !== "") {
        SearchDogami(newValue)
        .then((value) => dogamis.value = value)
        .catch((err) => console.error(err));
    }
})

function toggleOpen(event: Event) {
    event.stopPropagation()
    isOpen.value = !isOpen.value;
    isOpen.value && nextTick(() => {
        document.addEventListener('click', close)
    })
}

function close(event: Event) {
    if (
        event.target !== selectDiv.value
        && event.target !== searchInput.value
    ) {
        isOpen.value = false;
        document.removeEventListener('click', close)
    }
}

function dogamiLevel(dogami: main.Dogami): string {
    return dogami.attributes.find((attr) => attr.trait_type === 'Level')?.value ?? ''
}

function selectDogami(dogami: main.Dogami) {
    selectedDogami.value = dogami;
    search.value = "";
}

function resetInput() {
    search.value = "";
    selectedDogami.value = undefined;
}
</script>

<template>
    <div class="select-dogami_container" :open="isOpen">
        <div ref="selectDiv" class="select-dogami_select" @click="toggleOpen">
            <span v-if="selectedDogami === undefined" class="select-dogami_select_placeholder">
                Please select a Dogami
            </span>
            <span v-else class="select-dogami_select_value">
                <img :src="new DogamiHelper(selectedDogami).imageUrl">
                <span>{{ selectedDogami.name }}</span>
            </span>
        </div>
        <div class="select-dogami_dropdown">
            <div class="select-dogami_input">
                <input id="searchInput" ref="searchInput" type="text" v-model="search">
                <span v-show="search !== ''" class="reset-input" @click="resetInput">X</span>
            </div>
            <div v-show="search === ''" class="select-dogami_dropdown-no-search">
                <p>Please enter a Dogami name</p>
            </div>
            <div v-show="search !== '' && dogamis.length === 0" class="select-dogami_dropdown-no-results">
                <p>No results found</p>
            </div>
            <div v-for="dogami in dogamis" :key="dogami.nftId" class="select-dogami_option"
                @click="selectDogami(dogami)" :selected="selectedDogami?.nftId === dogami.nftId">
                <img loading="lazy" :src="new DogamiHelper(dogami).imageUrl">
                <div class="select-dogami_option_info">
                    <p>{{ dogami.name }}</p>
                    <p v-if="dogamiLevel(dogami)">Level : {{ dogamiLevel(dogami) }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.select-dogami_container {
    position: relative;
    width: 200px;
    height: 30px;

    .select-dogami_select {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: start;
        justify-content: center;
        padding-left: 15px;
        width: calc(100% - 15px);
        height: 100%;
        background-color: white;
        color: black;
        border: 1px solid rgb(15, 24, 37);
        border-radius: 5px;
        transition: border-radius 250ms ease-out 250ms;

        & .select-dogami_select_placeholder {
            user-select: none;
            color: rgba($color: #000000, $alpha: 0.6);
            font-size: 0.8rem;
        }

        & .select-dogami_select_value {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
            font-size: 0.8rem;

            img {
                height: 25px;
                aspect-ratio: auto;
                border-radius: 5px;
            }
        }
    }

    .select-dogami_dropdown {
        background-color: white;
        position: absolute;
        z-index: 1;
        top: 100%;
        max-height: 0;
        width: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
        border: 1px solid rgb(15, 24, 37);
        visibility: hidden;
        transition: all 250ms ease-in-out;

        &-no-search,
        &-no-results {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 30px;
            color: grey;
            font-style: italic;
            font-size: 0.8rem;
        }
    }

    .select-dogami_input {
        position: sticky;
        top: 0;
        background-color: white;
        padding: 5px 0;

        input {
            width: 90%;
            height: 30px;
            padding: 1px 5px;
            text-decoration: none;
            outline: none;
            border: 1px solid rgb(15, 24, 37);
            border-radius: 5px;

            &:active,
            &:focus {
                outline: none;
            }
        }

        .reset-input {
            cursor: pointer;
            color: black;
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
        }
    }

    &[open="true"] {
        .select-dogami_select {
            border-radius: 5px 5px 0 0;
            border-bottom: none;
            transition: none;
        }

        .select-dogami_dropdown {
            visibility: visible;
            max-height: 200px;
            border: 1px solid rgb(15, 24, 37);
            border-radius: 0 0 5px 5px;
            border-top: none;
        }
    }
}

.select-dogami_option {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 70px;
    color: rgb(15, 24, 37);
    gap: 10px;
    padding: 0 5px;
    font-size: 0.7rem;

    .select-dogami_option_info {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        text-align: center;

        p {
            margin: 0;
        }
    }

    img {
        height: 50px;
        aspect-ratio: auto;
        border-radius: 5px;
    }

    &:hover {
        cursor: pointer;
        user-select: none;
        background-color: rgb(15, 24, 37);
        color: white;
    }

    &:last-child {
        border-bottom: 5px;
    }
}
</style>