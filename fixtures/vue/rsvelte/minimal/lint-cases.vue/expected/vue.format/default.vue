<script setup>
import { ref } from "vue";

const unused = 1;
const label = ref("a");
</script>

<template>
  <ul>
    <li v-for="(item, i) in [1, 2]" :key="item">{{ label }}</li>
  </ul>
</template>
