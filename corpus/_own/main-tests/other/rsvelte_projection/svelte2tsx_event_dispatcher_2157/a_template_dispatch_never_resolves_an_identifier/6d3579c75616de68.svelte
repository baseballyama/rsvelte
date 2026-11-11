<script>
  import { createEventDispatcher } from 'svelte';
  const bla = 'bye';
  const dispatch = createEventDispatcher();
</script>

<button on:click={() => dispatch(bla)}></button>
