export class DogamiSkillEnum {
    private static allSkills: DogamiSkillEnum[] = [];

    public static readonly Velocity = 'velocity';
    public static readonly Swim = 'swim';
    public static readonly Jump = 'jump';
    public static readonly Balance = 'balance';
    public static readonly Might = 'might';
    public static readonly Instinct = 'instinct';

    constructor(
        public label: string,
        public value: string,
    ) { }

    public static find(needle: any): DogamiSkillEnum | null {
        if (typeof needle !== 'string') {
            return null;
        }

        for (const skill of DogamiSkillEnum.all()) {
            if (skill.value === needle || skill.label === needle) {
                return skill;
            }
        }

        return null;
    }

    public static all(): DogamiSkillEnum[] {
        if (DogamiSkillEnum.allSkills.length > 0) {
            return DogamiSkillEnum.allSkills;
        }

        DogamiSkillEnum.allSkills = [
            new DogamiSkillEnum(this.capitalize(DogamiSkillEnum.Velocity), DogamiSkillEnum.Velocity),
            new DogamiSkillEnum(this.capitalize(DogamiSkillEnum.Swim), DogamiSkillEnum.Swim),
            new DogamiSkillEnum(this.capitalize(DogamiSkillEnum.Jump), DogamiSkillEnum.Jump),
            new DogamiSkillEnum(this.capitalize(DogamiSkillEnum.Balance), DogamiSkillEnum.Balance),
            new DogamiSkillEnum(this.capitalize(DogamiSkillEnum.Might), DogamiSkillEnum.Might),
            new DogamiSkillEnum(this.capitalize(DogamiSkillEnum.Instinct), DogamiSkillEnum.Instinct),
        ];

        return DogamiSkillEnum.allSkills;
    }

    private static capitalize(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
}