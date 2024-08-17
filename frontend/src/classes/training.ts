import { main } from "../../wailsjs/go/models";

export class DogamiTrainingDatas {
    public starting_bonus: number;
    public starting_bonus_xp: number;
    public end_bonus: number;
    public treatType: DogamiTreatType;
    public stars_bag: number;

    constructor(
        starting_bonus: number = 0,
        starting_bonus_xp: number = 0,
        end_bonus: number = DogamiTraining.MAX_BONUSES,
        treatType: DogamiTreatType | null = null,
        stars_bag: number = Infinity
    ) {
        this.starting_bonus = starting_bonus;
        this.starting_bonus_xp = starting_bonus_xp;
        this.end_bonus = end_bonus;
        if (treatType === null) {
            this.treatType = DogamiTreatType.noTreats();
        } else {
            this.treatType = treatType;
        }
        this.stars_bag = stars_bag;

        if (this.starting_bonus > this.end_bonus) {
            throw new Error("Start bonus cannot be greater than end bonus");
        }
    }
}

export class DogamiTraining {
    public static readonly BONUS_LEVEL_CEILING = 100;
    public static readonly MAX_BONUSES = 200;

    public simulate(datas: DogamiTrainingDatas): DogamiTrainingResults {
        let actual_bonus = datas.starting_bonus;
        let actual_bonus_xp = datas.starting_bonus_xp;
        let stars_bag = datas.stars_bag;
        let total_cost = 0;
        let total_trainings = 0;

        while (actual_bonus < datas.end_bonus) {
            // Combien coûte le training
            const training_cost = this.getCost(datas.treatType, actual_bonus);

            // Ai-je pas assez de STARS ⭐️ ?
            if (stars_bag < training_cost) {
                break;
            }
            stars_bag -= training_cost;
            total_cost += training_cost;

            // Je fais un training car je peux payer 💸
            total_trainings++;

            // Je gagne mon XP
            actual_bonus_xp += this.getAverageXP(datas.treatType);

            // Je gagne peut-être un niveau de bonus
            if (actual_bonus_xp > DogamiTraining.BONUS_LEVEL_CEILING) {
                actual_bonus += Math.floor(actual_bonus_xp / DogamiTraining.BONUS_LEVEL_CEILING);
                actual_bonus_xp %= DogamiTraining.BONUS_LEVEL_CEILING;
            }
        }

        return new DogamiTrainingResults(
            datas.starting_bonus,
            datas.starting_bonus_xp,
            actual_bonus,
            actual_bonus_xp,
            datas.treatType,
            stars_bag,
            total_trainings,
            total_cost
        );
    }

    public getCost(treatType: DogamiTreatType, bonus: number): number {
        let cost = 0;

        switch (treatType.name) {
            case DogamiTreatType.NO_TREATS:
            case DogamiTreatType.SMALL_TREATS:
            case DogamiTreatType.MEDIUM_TREATS:
            case DogamiTreatType.LARGE_TREATS:
                cost += treatType.price;
                break;
            default:
                throw new Error('Not a valid Treat Type');
        }

        cost += DogamiTrainingPrice.find(bonus)?.price ?? 0;

        return cost;
    }

    public getAverageXP(treatType: DogamiTreatType): number {
        switch (treatType.name) {
            case DogamiTreatType.NO_TREATS:
            case DogamiTreatType.SMALL_TREATS:
            case DogamiTreatType.MEDIUM_TREATS:
            case DogamiTreatType.LARGE_TREATS:
                return treatType.averagePoints;
            default:
                throw new Error('Not a valid Treat Type');
        }
    }
}

export class DogamiTrainingPrice {
    private static all: DogamiTrainingPrice[] = [];

    constructor(
        public min_bonus: number,
        public max_bonus: number,
        public price: number,
        public min_dogami_level: number,
        public max_dogami_level: number,
    ) {}

    public static find(needle: number | main.Dogami): DogamiTrainingPrice | null {
        if (typeof needle !== 'number' && !(needle instanceof Object)) {
            return null;
        }

        if (typeof needle === 'number') {
            for (const trainingPrice of DogamiTrainingPrice.all) {
                if (trainingPrice.min_bonus <= needle && needle <= trainingPrice.max_bonus) {
                    return trainingPrice;
                }
            }
        }

        if (needle instanceof Object) {
            for (const trainingPrice of DogamiTrainingPrice.getAll()) {
                let levelAttr = needle.attributes.find(attr => attr.trait_type === "Level");
                if (
                    levelAttr !== undefined
                    && levelAttr.value >= trainingPrice.min_dogami_level
                    && levelAttr.value <= trainingPrice.max_dogami_level
                ) {
                    return trainingPrice;
                }
            }
        }

        return null;
    }

    public static getAll(): DogamiTrainingPrice[] {
        if (DogamiTrainingPrice.all.length === 0) {
            DogamiTrainingPrice.all = [
                new DogamiTrainingPrice(0, 19, 200, 0, 4),
                new DogamiTrainingPrice(20, 39, 400, 5, 9),
                new DogamiTrainingPrice(40, 59, 600, 10, 14),
                new DogamiTrainingPrice(60, 79, 800, 15, 19),
                new DogamiTrainingPrice(80, 99, 1000, 20, 24),
                new DogamiTrainingPrice(100, 119, 1200, 25, 29),
                new DogamiTrainingPrice(120, 139, 1400, 30, 34),
                new DogamiTrainingPrice(140, 159, 1600, 35, 39),
                new DogamiTrainingPrice(160, 179, 1800, 40, 44),
                new DogamiTrainingPrice(180, 199, 2000, 45, 49),
            ];
        }

        return DogamiTrainingPrice.all;
    }
}

export class DogamiTrainingResults {
    constructor(
        public starting_bonus: number,
        public starting_bonus_xp: number,
        public end_bonus: number,
        public end_bonus_xp: number,
        public treatType: DogamiTreatType,
        public starsLeft: number,
        public total_trainings: number,
        public total_training_cost: number,
    ) {}
}

export class DogamiTreatType {
    private static all: { [key: string]: DogamiTreatType } = {};

    public static NO_TREATS = 'No Treats';
    public static SMALL_TREATS = 'Small Treats';
    public static MEDIUM_TREATS = 'Medium Treats';
    public static LARGE_TREATS = 'Large Treats';

    public slug: string;

    constructor(
        public name: string,
        public averagePoints: number,
        public price: number,
        slug?: string,
    ) {
        this.slug = slug || DogamiTreatType.slugify(this.name);
    }

    public static slugify(name: string): string {
        return name.toLowerCase().replace(/ /g, '_');
    }

    public static find(needle: string): DogamiTreatType | null {
        if (typeof needle !== 'string') {
            throw new Error(`$needle should be a string ${typeof needle} given`);
        }

        needle = DogamiTreatType.slugify(needle);
        return DogamiTreatType.getAll()[needle] || null;
    }

    public static getAll(): { [key: string]: DogamiTreatType } {
        if (Object.keys(DogamiTreatType.all).length === 0) {
            DogamiTreatType.all = {
                [DogamiTreatType.slugify(DogamiTreatType.NO_TREATS)]: new DogamiTreatType(
                    DogamiTreatType.NO_TREATS,
                    (0.1 * 10) + (0.25 * 20) + (0.3 * 50) + (0.25 * 100) + (0.1 * 200),
                    0
                ),
                [DogamiTreatType.slugify(DogamiTreatType.SMALL_TREATS)]: new DogamiTreatType(
                    DogamiTreatType.SMALL_TREATS,
                    (0.04 * 10) + (0.19 * 20) + (0.3 * 50) + (0.31 * 100) + (0.16 * 200),
                    20
                ),
                [DogamiTreatType.slugify(DogamiTreatType.MEDIUM_TREATS)]: new DogamiTreatType(
                    DogamiTreatType.MEDIUM_TREATS,
                    (0 * 10) + (0.13 * 20) + (0.28 * 50) + (0.37 * 100) + (0.22 * 200),
                    100
                ),
                [DogamiTreatType.slugify(DogamiTreatType.LARGE_TREATS)]: new DogamiTreatType(
                    DogamiTreatType.LARGE_TREATS,
                    (0 * 10) + (0.01 * 20) + (0.16 * 50) + (0.49 * 100) + (0.34 * 200),
                    500
                ),
            };
        }

        return DogamiTreatType.all;
    }

    public static noTreats() {
        return this.getAll()[DogamiTreatType.slugify(DogamiTreatType.NO_TREATS)];
    }
}