<script setup>
import { ref } from 'vue'

const kind = ref('button')
</script>

<template>
  <div>
    <button>missing</button>
    <button type>bare</button>
    <button type="">empty</button>
    <button type="foo">invalid</button>
    <button type=foo>unquoted</button>
    <button type="&#115;ubmit">decoded</button>
    <button TYPE="reset">upper</button>
    <button :type="kind">bound</button>
    <button :type="kind" type="nope">static first</button>
    <span type="foo">not a button</span>
  </div>
</template>
