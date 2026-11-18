<script setup>
import { computed, ref } from 'vue'

const todos = ref([{ id: 1, text: 'write tests', done: true }])
const draft = ref('')
let next = 2
const remaining = computed(() => todos.value.filter((t) => t.done).length)

function add() {
  const text = draft.value.trim()
  if (!text) return
  todos.value.push({ id: next++, text, done: false })
  draft.value = ''
}

function clearDone() {
  todos.value = todos.value.filter((t) => !t.done)
}
</script>

<template>
  <form class="new" @submit.prevent="add">
    <input class="draft" v-model="draft" placeholder="What needs doing?" @keydown.escape="draft = ''">
    <button class="add" :disabled="!draft.trim()">add</button>
  </form>
  <ul class="todos">
    <li v-for="todo in todos" :key="todo.id" :class="{ done: todo.done }">
      <label><input type="checkbox" v-model="todo.done"> {{ todo.text }}</label>
    </li>
  </ul>
  <p class="summary"><span>{{ remaining }}</span> <span>{{ remaining === 1 ? 'item' : 'items' }} left</span></p>
  <button v-if="todos.some((t) => t.done)" class="clear" @click="clearDone">clear done</button>
</template>
