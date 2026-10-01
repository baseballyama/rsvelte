<script setup>
import { computed, ref } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>

<template>
  <div class="counter">
    <button class="dec" @click="count--">-</button>
    <span class="count">{{ count }}</span>
    <button class="inc" @click="count++">+</button>
  </div>
  <p>doubled: {{ doubled }}</p>
</template>
