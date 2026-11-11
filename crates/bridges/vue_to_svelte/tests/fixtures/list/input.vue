<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'apple' },
  { id: 2, name: 'banana' },
])
let next = 3

function add() {
  items.value.push({ id: next, name: `item ${next}` })
  next++
}

function removeFirst() {
  items.value.shift()
}
</script>

<template>
  <ul>
    <li v-for="(item, i) in items" :key="item.id">{{ i + 1 }}. {{ item.name }}</li>
  </ul>
  <p v-if="items.length === 0">empty</p>
  <button class="add" @click="add">add</button>
  <button class="remove" @click="removeFirst">remove first</button>
</template>
