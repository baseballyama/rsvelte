<script setup>
import { ref } from "vue";

const count = ref(0);
const age = ref(18);
</script>

<template>
  <div>
    <input type="number" v-model="count" />
    <input v-model.number="age" />
    <p>{{ count + age }}</p>
  </div>
</template>
