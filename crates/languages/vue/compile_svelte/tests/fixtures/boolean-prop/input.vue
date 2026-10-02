<script setup>
const props = defineProps({ flag: Boolean, shown: Boolean })
</script>

<template>
  <p>flag {{ String(props.flag) }}, shown {{ String(props.shown) }}</p>
</template>
