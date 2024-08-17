import { reactive } from "vue";
import { DogamiDownloadStates } from "./classes/helper";

export const dogamisDownloadStateStore = reactive({
    state: DogamiDownloadStates.Null
})