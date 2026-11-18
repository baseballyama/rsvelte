<script setup>
import { ref } from "vue";

const agreed = ref(false);
const picked = ref("a");
</script>

<template>
  <form>
    <input type="checkbox" v-model="agreed" />
    <input type="radio" value="a" v-model="picked" />
    <input type="radio" value="b" v-model="picked" />
    <button type="submit" :disabled="!agreed">Send</button>
  </form>
</template>
