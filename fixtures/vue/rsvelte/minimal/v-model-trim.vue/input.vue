<script setup>
import { ref } from 'vue'

const query = ref('')
</script>

<template>
  <input v-model.trim="query" placeholder="Search" />
  <input v-model.lazy.trim="query" />
</template>
