<script setup>
defineProps({ href: String, label: String });
</script>

<template>
  <a :href="href" class="link" :title="'go to ' + label">{{ label }}</a>
</template>
