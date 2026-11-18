<script setup lang="ts">
import { ref } from "vue";

interface Item {
  name: string;
}

const item = ref<Item>({ name: "a" });
const shout = (s: string): string => s.toUpperCase();
</script>

<template>
  <p>{{ shout(item.name) }}</p>
</template>
