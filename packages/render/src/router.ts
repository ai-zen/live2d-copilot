import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import DesktopPetWindow from "./views/DesktopPetWindow/index.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/desktop-pet-window",
    component: DesktopPetWindow,
  },
];

export default createRouter({
  routes: routes,
  history: createWebHistory(),
});
