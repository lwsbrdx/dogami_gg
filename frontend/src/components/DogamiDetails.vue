<script lang="ts" setup>
import { watch } from 'vue';
import { main } from '../../wailsjs/go/models';
import { DogamiHelper } from '../classes/helper';

const dogami = defineModel({
    type: main.Dogami,
    required: true,
})

let helper = new DogamiHelper(dogami.value)

function getSkillImageUrl(skill: main.DogamiAttribute): string {
    return new URL(`../assets/images/skills/${skill.trait_type.toLowerCase()}.png`, import.meta.url).href;
}

watch(dogami, (value) => {
    helper = new DogamiHelper(value);
});
</script>

<template>
    <div v-if="dogami" class="dogami-details">
        <p>{{ dogami.name }}</p>
        <img class="dogami-details-image" :src="helper.imageUrl">
        <p> ID : {{ dogami.nftId }}</p>
        <p> Level : {{ helper.level }}</p>
        <div v-if="helper.skills.length" class="dogami-details-skills">
            <div class="dogami-details-skill" v-for="skill in helper.skills">
                <img :src="getSkillImageUrl(skill)">
                <p>{{ skill.trait_type }}</p>
                <p>{{ skill.rank }}</p>
                <p>{{ skill.level + skill.bonus_level }}</p>
                <p v-if="skill.bonus_level">
                    {{ skill.level }} (+{{ skill.bonus_level }})
                </p>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.dogami-details {
    .dogami-details-image {
        height: 200px;
        aspect-ratio: auto;
        border-radius: 5px;
        margin: 15px 0;
    }

    p {
        margin: 0;
    }

    &-skills {
        $cell-width: 110px;

        display: grid;
        gap: 10px;
        width: fit-content;
        min-height: 260px;
        height: fit-content;
        margin: 0 auto;
        grid-template-rows: repeat(2, min-content);
        grid-template-columns: repeat(3, $cell-width);
        border: 1px solid grey;
        border-radius: 5px;

        margin-top: 25px;
        padding: 16px 10px;
    }

    &-skill {
        height: fit-content;
        min-height: 125px;

        img {
            height: 30px;
            aspect-ratio: auto;
        }

        p {
            margin: 0;
        }
    }
}
</style>