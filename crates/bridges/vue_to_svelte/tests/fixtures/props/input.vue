<script setup>
import { ref } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Count' },
  start: { type: Number, default: 0 },
  step: { type: Number, default: 1 },
})
const count = ref(props.start)
</script>

<template>
  <button class="bump" @click="count += props.step">{{ props.label }}: {{ count }}</button>
</template>
