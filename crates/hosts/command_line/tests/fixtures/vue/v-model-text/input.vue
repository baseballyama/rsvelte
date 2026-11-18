<script setup>
import { ref } from 'vue'

const name = ref('')
</script>

<template>
  <label>
    Name
    <input v-model="name" />
  </label>
  <p>Hello, {{ name }}!</p>
</template>
