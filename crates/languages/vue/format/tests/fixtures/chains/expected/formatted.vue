<script setup>
defineProps({ kind: String, items: Array });
</script>

<template>
  <div>
    head
    <span v-if="kind === 'a'">A</span>
    <span v-else-if="kind === 'b'">B {{ kind }}</span>
    <span v-else>other</span>
    tail {{ kind }}
    <b v-if="items.length">{{ items.length }}</b>
  </div>
</template>
