<script setup>
defineProps({ ok: Boolean });
</script>

<template>
  <p v-if="ok">yes</p>
  <p v-else>no</p>
</template>
