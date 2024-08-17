import './style.css';
import "vue3-toastify/dist/index.css";
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { EventsOn } from '../wailsjs/runtime/runtime';
import { Ref, ref } from "vue";
import { DogamiDownloadStates } from "./classes/helper";
import { dogamisDownloadStateStore } from "./store";
import { Id, toast } from "vue3-toastify";
import { main } from '../wailsjs/go/models';

const dogamisDownloadToast: Ref<Id | undefined> = ref(undefined);

createApp(App)
    .use(router)
    .mount('#app')


EventsOn('dogami:saved', (datas: { dogami: main.Dogami }) => {
    toast(`${datas.dogami.name} successfully saved !`, {
        "theme": "dark",
        "type": "info",
        "pauseOnHover": false,
        "transition": "flip"
    })
})

EventsOn(main.DogamiEvents.DogamiDownloadStart, () => {
    dogamisDownloadToast.value = toast(`Downloading Dogamis`, {
        theme: "dark",
        type: toast.TYPE.DEFAULT,
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
    });

    dogamisDownloadStateStore.state = DogamiDownloadStates.Started
});

EventsOn(main.DogamiEvents.DogamiDownloadDone, () => {
    if (dogamisDownloadToast.value === undefined) {
        return;
    }

    toast.update(dogamisDownloadToast.value, {
        render: `Done`,
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
        closeOnClick: true,
        pauseOnHover: false,
    })

    dogamisDownloadStateStore.state = DogamiDownloadStates.Done
});

EventsOn('dogamis:download:progress', (datas: { downloaded: number, total: number }) => {
    const percentage = (datas.downloaded / datas.total * 100).toFixed(2);
    if (dogamisDownloadToast.value === undefined) {
        return;
    }

    toast.update(dogamisDownloadToast.value, {
        render: `Downloading Dogamis (${percentage}%)`,
    });

    dogamisDownloadStateStore.state = DogamiDownloadStates.InProgress
});