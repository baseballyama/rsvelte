<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const items = ref([{ id: 1, name: 'a' }])
const label = 'x'
function inc(e: MouseEvent) {
  return e.button
}
</script>

<template>
  <div aria-label="x" class="a" :class="{ on: count.nope }" :aria-busy="label.missing">
    <button @click="inc" @keydown="inc($event)" @mouseover="count.bad()">{{ count }}</button>
    <li v-for="(item, i) in items" :key="item.id">{{ i.toFixed(1).zz }} {{ item.title }}</li>
    <span v-for="n in 3">{{ n.length }}</span>
    <p v-if="count === 1">a</p>
    <p v-else-if="count === 'two'">b</p>
    <p v-else>{{ { label, count }.label.nope }}</p>
    <input disabled :value="undefinedName">
  </div>
</template>
