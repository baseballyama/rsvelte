<script setup lang="ts">
import { ref } from 'vue'

const n: number = 'x'
const count = ref(0)
const maybe = ref<string | undefined>()
</script>

<template>
  <button type="button" @click="count.toUpperCase()">{{ n.foo }}</button>
  <p v-if="maybe">{{ maybe.length }}</p>
  <p v-else>{{ maybe.length }}</p>
  <p :title="count.bar">😀 {{ count.baz }}</p>
</template>
