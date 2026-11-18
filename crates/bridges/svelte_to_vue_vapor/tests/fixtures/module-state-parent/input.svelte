<script>
  import Child from '../module-state-child/input.svelte';
  let visible = $state(true);
</script>
<button onclick={() => visible = !visible}>toggle</button>
<Child label="first" />
{#if visible}<Child label="second" />{/if}
