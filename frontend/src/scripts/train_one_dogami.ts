import { ref } from "vue";
import { DogamiTrainingDatas, DogamiTreatType, DogamiTrainingResults, DogamiTrainingPrice, DogamiTraining } from "../classes/training";
import { DogamiSkillEnum } from "../classes/dogami";
import { main } from '../../wailsjs/go/models'

export async function trainOneDogami(dogami: main.Dogami) {
    let trainingError: string | null = null
    const trainingResultsBySkill = ref<Record<string, DogamiTrainingResults[]>>({});
    const totalsCosts = ref<Record<string, number>>({});
    const totalsTrainings = ref<Record<string, number>>({});

    if (dogami !== undefined) {
        if (dogami.attributes.find(attr => attr.trait_type === "Status")?.value === "Box") {
            trainingError = "This Dogami is still a Box, you can't train it";
            return {
                results: trainingResultsBySkill.value,
                totals_costs: totalsCosts.value,
                totals_trainings: totalsTrainings.value,
                error: trainingError,
            };
        }

        let skills = dogami.attributes.filter(attr => {
            return [
                'Velocity',
                'Jump',
                'Swim',
                'Instinct',
                'Might',
                'Balance',
            ].includes(attr.trait_type)
        });

        if (skills.length === 0) {
            return {
                results: trainingResultsBySkill.value,
                totals_costs: totalsCosts.value,
                totals_trainings: totalsTrainings.value,
                error: "No skills found, try updating dogamis",
            };
        }

        skills.forEach(skill => {
            const trainingPrice = DogamiTrainingPrice.find(dogami);
            const skillEnum = DogamiSkillEnum.find(skill.trait_type);

            if (!trainingPrice || !skillEnum) {
                trainingError = "An error occured finding training price or skill";
                return;
            }

            let endBonusLevel = trainingPrice.max_bonus + 1;
            if (skill.bonus_level && trainingPrice.max_bonus < skill.bonus_level) {
                endBonusLevel = trainingPrice.max_bonus + (skill.bonus_level - trainingPrice.max_bonus);
            }

            const trainingDatas = new DogamiTrainingDatas(
                skill.bonus_level ?? 0,
                (skill.bonus ?? 0) - ((skill.bonus_level ?? 0) * 100),
                endBonusLevel,
                null,
                Number.POSITIVE_INFINITY
            );

            Object.values(DogamiTreatType.getAll()).forEach(dogamiTreatType => {
                const training = new DogamiTraining();
                trainingDatas.treatType = dogamiTreatType;
                const result = training.simulate(trainingDatas);

                if (!trainingResultsBySkill.value[skillEnum.value]) {
                    trainingResultsBySkill.value[skillEnum.value] = [];
                }

                trainingResultsBySkill.value[skillEnum.value].push(result);

                totalsCosts.value[result.treatType.slug] = (totalsCosts.value[result.treatType.slug] ?? 0) + result.total_training_cost;
                totalsTrainings.value[result.treatType.slug] = (totalsTrainings.value[result.treatType.slug] ?? 0) + result.total_trainings;
            });
        });
    }

    return {
        results: trainingResultsBySkill.value,
        totals_costs: totalsCosts.value,
        totals_trainings: totalsTrainings.value,
        error: trainingError,
    };
}