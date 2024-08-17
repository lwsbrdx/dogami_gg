export namespace main {
	
	export enum DogamiEvents {
	    DogamiSaved = "dogami:saved",
	    DogamiDownloadStart = "dogamis:download:start",
	    DogamiDownloadProgress = "dogamis:download:progress",
	    DogamiDownloadDone = "dogamis:download:done",
	}
	export class DogamiAttribute {
	    display_type: string;
	    trait_type: string;
	    value: any;
	    level: number;
	    min_value: number;
	    max_value: number;
	    rank: string;
	    bonus: number;
	    bonus_level: number;
	
	    static createFrom(source: any = {}) {
	        return new DogamiAttribute(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.display_type = source["display_type"];
	        this.trait_type = source["trait_type"];
	        this.value = source["value"];
	        this.level = source["level"];
	        this.min_value = source["min_value"];
	        this.max_value = source["max_value"];
	        this.rank = source["rank"];
	        this.bonus = source["bonus"];
	        this.bonus_level = source["bonus_level"];
	    }
	}
	export class Dogami {
	    nftId: number;
	    name: string;
	    owner: string;
	    image: string;
	    animation_url: string;
	    description: string;
	    attributes: DogamiAttribute[];
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Dogami(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.nftId = source["nftId"];
	        this.name = source["name"];
	        this.owner = source["owner"];
	        this.image = source["image"];
	        this.animation_url = source["animation_url"];
	        this.description = source["description"];
	        this.attributes = this.convertValues(source["attributes"], DogamiAttribute);
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

