<script setup>
const items = [];
</script>

<template>
  <ul>
    <li v-for="({ a, b }, i) in items" :key="i">{{ b }}</li>
    <li v-for="([c, d], j) in items" :key="j">{{ c }}</li>
    <li v-for="(item, k) in items" :key="k">x</li>
  </ul>
</template>
