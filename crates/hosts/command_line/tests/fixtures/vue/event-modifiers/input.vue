<script setup>
import { ref } from 'vue'

const count = ref(0)
const rows = ref([{ id: 1 }, { id: 2 }])
function inc() {
  count.value++
}
function pick(row) {
  console.log(row)
}
</script>

<template>
  <form @submit.prevent="inc">
    <button @click.stop="inc">stop</button>
    <button @click.stop.prevent="count++">both</button>
    <div @click.self="inc">self</div>
    <button @click.ctrl.exact="inc">ctrl</button>
    <button @click.right="inc">right</button>
    <button @click.middle="inc">middle</button>
    <button @click.once="inc">once</button>
    <div @scroll.passive.capture="inc">options</div>
    <input @keyup.enter="inc" @keydown.esc.stop="() => inc()" />
    <input @keydown.left="inc" @keyup.ctrl.page-down="inc" />
    <ul>
      <li v-for="row in rows" :key="row.id" @click.prevent="pick(row)">{{ row.id }}</li>
    </ul>
  </form>
  <p>{{ count }}</p>
</template>
