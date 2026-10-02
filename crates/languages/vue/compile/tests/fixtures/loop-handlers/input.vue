<script setup>
import { ref } from 'vue'

const rows = ref([{ id: 1, name: 'a' }])
function pick(row) {
  console.log(row)
}
</script>

<template>
  <ul>
    <li v-for="row in rows" :key="row.id" @click="pick(row)">
      <span v-if="row.name">{{ row.name }}</span>
    </li>
  </ul>
  <button @click="(e) => pick(e)">x</button>
</template>
