<script setup>
import { computed, ref } from 'vue'

const name = ref('world')
const shout = computed(() => name.value.toUpperCase())
</script>

<template>
  <label>Name <input class="name" v-model.lazy="name"></label>
  <p class="greeting">Hello, {{ name }}!</p>
  <p class="shout">{{ shout }} ({{ name.length }})</p>
</template>
