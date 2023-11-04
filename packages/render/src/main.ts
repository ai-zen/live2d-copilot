import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCN from "element-plus/es/locale/lang/zh-cn";
import "./style.css";
import App from "./App.vue";
import router from "./router";

createApp(App).use(ElementPlus, { locale: zhCN }).use(router).mount("#app");
