<script setup>
import { msg } from "./data.js";
let n = 1;
const obj = { a: 1 };
</script>

<template>
  <p :title="msg" @input="msg = $event">{{ msg }} {{ n }} {{ obj.a }}</p>
</template>
