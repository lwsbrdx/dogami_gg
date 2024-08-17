import { createMemoryHistory, createRouter } from 'vue-router'

import Home from './views/Home.vue'
import Training from './views/Training.vue'
import Compare from './views/Compare.vue'
import Settings from './views/Settings.vue'
import Details from './views/Details.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/dogami/:id', component: Details },
    { path: '/training', component: Training },
    { path: '/compare', component: Compare },
    { path: '/settings', component: Settings },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router