<script setup>
defineProps({ items: Array })
</script>

<template>
  <ul>
    <li v-for="(item, i) in items" :key="i">{{ i }}: {{ item }}</li>
  </ul>
</template>
