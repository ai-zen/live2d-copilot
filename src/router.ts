import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import DesktopPetView from "./views/DesktopPetView.vue";
import LoadingView from "./views/LoadingView.vue";
import ModelsView from "./views/ModelsView.vue";
import SettingsView from "./views/SettingsView.vue";
import PluginsView from "./views/PluginsView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/desktop-pet",
    component: DesktopPetView,
  },
  {
    path: "/loading",
    component: LoadingView,
  },
  {
    path: "/models-window",
    component: ModelsView,
  },
  {
    path: "/settings-window",
    component: SettingsView,
  },
  {
    path: "/plugins-window",
    component: PluginsView,
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

export default router;
