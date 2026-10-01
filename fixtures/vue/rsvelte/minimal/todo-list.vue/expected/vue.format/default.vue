<script setup>
import { ref, computed } from "vue";

const todos = ref([]);
const draft = ref("");
let next = 0;
const remaining = computed(() => todos.value.filter((t) => !t.done).length);

function add() {
  const text = draft.value.trim();
  if (!text) return;
  todos.value.push({ id: next++, text, done: false });
  draft.value = "";
}

function remove(id) {
  todos.value = todos.value.filter((t) => t.id !== id);
}
</script>

<template>
  <section>
    <input v-model.trim="draft" placeholder="What needs doing?" />
    <button @click="add">Add</button>
    <ul v-if="todos.length">
      <li v-for="todo in todos" :key="todo.id">
        <input type="checkbox" v-model="todo.done" />
        <span>{{ todo.text }}</span>
        <button @click="remove(todo.id)">x</button>
      </li>
    </ul>
    <p v-else>Nothing to do.</p>
    <p>{{ remaining }} left</p>
  </section>
</template>
