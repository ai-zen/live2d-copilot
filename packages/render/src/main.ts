import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { i18n } from "./modules/i18n";

createApp(App).use(ElementPlus).use(router).mount("#app");

i18n.init();
