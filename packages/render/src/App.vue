<template>
  <el-config-provider :locale="locale">
    <RouterView></RouterView>
  </el-config-provider>
</template>

<script lang="ts" setup>
import { ElConfigProvider } from "element-plus";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { computed } from "vue";
import { i18n } from "./modules/i18n";

const locale = computed(() => {
  return (
    {
      zh: zhCn,
      en,
    }[i18n.state.lang] ?? en
  );
});
</script>
