<script setup>
import { ref } from 'vue'

const size = ref('m')
const note = ref('none')
</script>

<template>
  <select class="size" v-model="size">
    <option value="s">small</option>
    <option value="m">medium</option>
    <option value="l">large</option>
  </select>
  <input class="note" v-model.lazy="note">
  <p class="summary">size {{ size }}, note {{ note }}</p>
</template>
