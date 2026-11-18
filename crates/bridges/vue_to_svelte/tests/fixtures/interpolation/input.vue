<script setup>
const object = { a: 1, b: [true, null] }
const list = ['x', 'y']
const nothing = undefined
</script>

<template>
  <pre>{{ object }}</pre>
  <p>{{ list }}</p>
  <p>[{{ nothing }}] [{{ null }}]</p>
</template>
