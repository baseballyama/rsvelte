<script setup>
import { ref } from 'vue'

const agreed = ref(false)
</script>

<template>
  <label><input type="checkbox" class="agree" v-model="agreed"> I agree</label>
  <p class="status">{{ agreed ? 'agreed' : 'not yet' }}</p>
  <button class="submit" :disabled="!agreed">continue</button>
</template>
