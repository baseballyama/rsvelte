<script setup>
import { ref, computed } from "vue";
const items = ref([1, 2, 3]);
const total = computed(() => items.value.length * 2 + 1);
</script>
<template>
  <section class="list" :data-count="total">
    <h2>List</h2>
    <p v-if="items.length > 0">
      {{ total }} items, the first one is {{ items[0] }} and there is a long
      tail of text here
    </p>
    <p v-else>none</p>
  </section>
</template>
<style>
.list {
  color: red;
  margin: 0 auto;
}
h2 {
  font-weight: bold;
}
</style>
