import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import DesktopPetWindow from "./views/DesktopPetWindow/index.vue";
import ModelsWindow from "./views/ModelsWindow/index.vue";
import PluginsWindow from "./views/PluginsWindow/index.vue";
import SettingWindow from "./views/SettingWindow/index.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/desktop-pet-window",
    component: DesktopPetWindow,
    meta: { title: "Live2D Copilot" },
  },
  {
    path: "/models-window",
    component: ModelsWindow,
    meta: { title: "模型" },
  },
  {
    path: "/plugins-window",
    component: PluginsWindow,
    meta: { title: "插件" },
  },
  {
    path: "/setting-window",
    component: SettingWindow,
    meta: { title: "设置" },
  },
];

const router = createRouter({
  routes: routes,
  history: createWebHistory(),
});

router.afterEach((to) => {
  if (typeof to.meta?.title == "string") document.title = to.meta.title;
});

export default router;
