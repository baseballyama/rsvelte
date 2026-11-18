<script setup>
import { ref } from "vue";

const notes = ref("");
</script>

<template>
  <textarea v-model="notes" rows="4"></textarea>
  <p>{{ notes.length }} characters</p>
</template>
