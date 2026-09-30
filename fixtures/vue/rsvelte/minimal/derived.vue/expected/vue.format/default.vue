<script setup>
import { ref, computed } from "vue";

const count = ref(1);
const double = computed(() => count.value * 2);

function increment() {
  count.value += 1;
}
</script>

<template>
  <button type="button" @click="increment">
    {{ count }} * 2 = {{ double }}
  </button>
</template>
