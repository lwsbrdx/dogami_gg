import { main } from '../../wailsjs/go/models'
import { DogamiSkillEnum } from './dogami'

export enum Providers {
    DogamiDownload = 'DogamiDownloadStateProvider'
}

export enum DogamiDownloadStates {
    Null,
    Started,
    InProgress,
    Done
}

export class DogamiHelper {
    constructor(
        public dogami: main.Dogami
    ) { }

    private findAttr(attrName: string): main.DogamiAttribute {
        const found = this.dogami.attributes.find(
            (attribute) => attribute.trait_type === attrName
        )

        if (!found) {
            console.error(this.dogami)
            throw `${attrName} not found`
        }

        return found
    }

    public get level(): number {
        if (this.isBox) return 0

        return this.findAttr("Level").value
    }

    public get isBox(): boolean {
        const status = this.findAttr("Status")

        if (status.value === "Box") {
            return true
        }

        return false;
    }

    public get imageUrl(): string {
        if (this.dogami.image.includes('cdn.dogami.com')) {
            return this.dogami.image;
        }

        return `https://ipfs.io/ipfs/${this.dogami.image.split('ipfs://')[1]}`
    }

    public get skills(): main.DogamiAttribute[] {
        if (this.isBox) return []

        return this.dogami.attributes.filter(attr => {
            return DogamiSkillEnum.all()
                .map(skillEnum => skillEnum.label)
                .includes(attr.trait_type)
        });
    }
}