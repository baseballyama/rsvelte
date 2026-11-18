<script setup>
import { ref } from "vue";

const color = ref("red");
</script>

<template>
  <select v-model="color">
    <option value="red">Red</option>
    <option value="green">Green</option>
  </select>
</template>
