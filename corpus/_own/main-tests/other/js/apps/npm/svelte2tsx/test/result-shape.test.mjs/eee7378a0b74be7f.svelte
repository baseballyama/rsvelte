
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let name: string;
  export const version = '1';
  const dispatch = createEventDispatcher();
  function greet() { dispatch('greet', name); }
</script>

<h1 on:click={greet}>Hello, {name}!</h1>
