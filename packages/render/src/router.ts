import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import DesktopPetWindow from "./views/DesktopPetWindow/index.vue";
import ModelsWindow from "./views/ModelsWindow/index.vue";
import PluginsWindow from "./views/PluginsWindow/index.vue";
import SettingWindow from "./views/SettingWindow/index.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/desktop-pet-window",
    component: DesktopPetWindow,
  },
  {
    path: "/models-window",
    component: ModelsWindow,
  },
  {
    path: "/plugins-window",
    component: PluginsWindow,
  },
  {
    path: "/setting-window",
    component: SettingWindow,
  },
];

export default createRouter({
  routes: routes,
  history: createWebHistory(),
});
