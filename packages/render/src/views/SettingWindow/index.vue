<template>
  <div>
    <el-form v-if="settingState.data">
      <el-form-item prop="lang" label="language">
        <el-select v-model="settingState.data.lang">
          <el-option value="zh" label="简体中文"></el-option>
          <el-option value="en" label="English"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useSetting } from "./composable/useSetting";

const { settingState } = useSetting();
</script>

<style scoped></style>
