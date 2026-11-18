<script setup>
import { ref } from 'vue'

const n = ref(1)
</script>

<template>
  <input type="number" v-model="n">
  <p>{{ typeof n }}: {{ n }} + 1 = {{ n + 1 }}</p>
</template>
