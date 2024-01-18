import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import DesktopPetWindow from "./views/DesktopPetWindow/index.vue";
import ModelsWindow from "./views/ModelsWindow/index.vue";
import PluginsWindow from "./views/PluginsWindow/index.vue";
import SettingWindow from "./views/SettingWindow/index.vue";
import { i18n } from "./modules/i18n";

const routes: RouteRecordRaw[] = [
  {
    path: "/desktop-pet-window",
    component: DesktopPetWindow,
    meta: { title: i18n.t("windows_title.desktop_pet") },
    // This window title should be dynamically set based on the current model.
  },
  {
    path: "/models-window",
    component: ModelsWindow,
    meta: { title: i18n.t("windows_title.models") },
  },
  {
    path: "/plugins-window",
    component: PluginsWindow,
    meta: { title: i18n.t("windows_title.plugins") },
  },
  {
    path: "/setting-window",
    component: SettingWindow,
    meta: { title: i18n.t("windows_title.settings") },
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
