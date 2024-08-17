<script setup lang="ts">
import { main } from '../../wailsjs/go/models'
import { Ref, ref, watch } from 'vue';
import { trainOneDogami } from '../scripts/train_one_dogami';
import { DogamiTrainingResults, DogamiTreatType } from '../classes/training';
import { DogamiSkillEnum } from '../classes/dogami';
import SelectDogami from '../components/SelectDogami.vue'
import VueHorizontal from "vue-horizontal";

const trainingResults = ref<Record<string, DogamiTrainingResults[]>>({});
const trainingError = ref<string | null>("");
const totalsCosts = ref<Record<string, number>>({});
const totalsTrainings = ref<Record<string, number>>({});
const dogami: Ref<main.Dogami | undefined> = ref()

const inputError = ref("")
const isLoading = ref(false);

async function getResults() {
    inputError.value = "";
    if (dogami.value === undefined) {
        inputError.value = "Please select a Dogami";
        return;
    }

    isLoading.value = true;
    trainOneDogami(dogami.value)
        .then(
            (results) => {
                // TODO : Fix issue w level 50 dogamis  
                trainingError.value = results.error;
                trainingResults.value = results.results;
                totalsCosts.value = results.totals_costs;
                totalsTrainings.value = results.totals_trainings;
                isLoading.value = false;
            }
        ).catch(err => console.error(err));
}

function reset() {
    dogami.value = undefined;
    inputError.value = "";
    trainingResults.value = {};
    totalsCosts.value = {};
    totalsTrainings.value = {};
}
</script>

<template>
    <h1>Training Simulator</h1>
    <div class="input">
        <div>
            <SelectDogami v-model:model-value="dogami" />
            <button @click="getResults()">Simulate</button>
            <button @click="reset()">Reset</button>
        </div>
        <span class="error">{{ inputError }}</span>
        <span class="error">{{ trainingError }}</span>
    </div>

    <div class="results" v-if="Object.keys(trainingResults).length > 0 && isLoading === false">
        <h1>Training Results</h1>

        <vue-horizontal :items-to-show="1" class="results-carousel">
            <section v-for="(results, skill) in trainingResults" :key="skill">
                <div class="result-slide">
                    <h2>{{ DogamiSkillEnum.find(skill)?.label }}</h2>
                    <div class="result-slide-grid">
                        <div v-for="result in results" :key="result.treatType.slug">
                            <div class="result-slide-details">
                                <h3>{{ result.treatType.name }}</h3>
                                <p>Cost: {{ result.total_training_cost }} ★</p>
                                <p>Trainings: {{ result.total_trainings }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </vue-horizontal>

        <div class="results-total">
            <h2>Totals</h2>
            <div class="results-total-grid">
                <div v-for="(cost, treat) in totalsCosts" :key="treat">
                    <div class="result-slide-details">
                        <h3>{{ DogamiTreatType.find(treat)?.name }}</h3>
                        <p>Cost: {{ cost }} ★</p>
                        <p>Trainings: {{ totalsTrainings[treat] }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="isLoading === true">
        <p>Loading Trainings for Dogami {{ dogami?.name }}</p>
    </div>
</template>

<style lang="scss" scoped>
$cell-height: 120px;
$cell-width: 200px;

.input {
    display: flex;
    flex-direction: column;
    max-width: 50%;
    margin: 0 auto;

    &>div {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .error {
        color: crimson;
        margin-top: 10px;
    }
}

.results-total,
.result-slide {
    ul {
        list-style: none;
        padding: 0;
    }
}

.results {
    width: 90%;
    margin: 25px auto 0;

    &-carousel {
        section {
            width: calc(100% - (16px + 16px));
            padding: 16px 8px;
        }

        section:first-child {
            width: calc(100% - (16px));
            padding-left: 24px;
        }

        section:last-child {
            width: calc(100% - (16px));
            padding-right: 24px;
        }
    }

    & .result-slide {
        display: flex;
        flex-direction: column;
        justify-content: center;

        &-grid {
            display: grid;
            grid-template-rows: repeat(2, $cell-height);
            grid-template-columns: repeat(2, $cell-width);
            gap: 10px;
            margin: 0 auto;
        }

        &-details {
            p {
                margin: 0;
            }
        }
    }

    &-total {
        display: flex;
        flex-direction: column;
        justify-content: center;

        &-grid {
            display: grid;
            grid-template-rows: repeat(1, $cell-height);
            grid-template-columns: repeat(4, 160px);
            gap: 10px;
            margin: 0 auto;
        }
    }
}
</style>