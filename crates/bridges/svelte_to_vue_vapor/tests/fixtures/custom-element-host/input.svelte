<svelte:options customElement={{ tag: 'rsvelte-counter', shadow: 'open' }} immutable={true} accessors={false} />
<script>
  import { onMount } from 'svelte';
  let count = $state(0);
  let events = $state(0);
  onMount(() => {
    const host = $host();
    const update = () => events++;
    host.addEventListener('increment', update);
    return () => host.removeEventListener('increment', update);
  });
  function increment() {
    count++;
    $host().dispatchEvent(new CustomEvent('increment', { detail: count }));
  }
</script>
<p>{count}/{events}</p>
<button onclick={increment}>increment</button>
<style>
  button { color: rgb(1, 2, 3); font-size: 19px; }
</style>
