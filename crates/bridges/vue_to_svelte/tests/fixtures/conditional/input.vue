<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <button class="toggle" @click="open = !open">{{ open ? 'Hide' : 'Show' }}</button>
  <p v-if="open" class="details">Details are visible.</p>
  <p v-else class="hint">Nothing to see.</p>
</template>
