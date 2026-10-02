<script setup>
import { reactive } from 'vue'

const form = reactive({ email: '', subscribe: true })
</script>

<template>
  <div>
    <input type="email" v-model.trim="form.email" />
    <input type="checkbox" v-model="form.subscribe" />
    <p>{{ form.email }}</p>
  </div>
</template>
