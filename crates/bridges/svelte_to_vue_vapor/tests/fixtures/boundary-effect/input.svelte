<script>
  import { untrack } from 'svelte';
  import Child from '../boundary-effect-child/input.svelte';
  let broken = $state(false);
  let events = $state([]);
  const record = (event) => untrack(() => events.push(event));
</script>
<button onclick={() => broken = true}>break</button>
<output>{events.join(',')}</output>
<svelte:boundary onerror={(error) => record(error.message)}>
  <Child {broken} {record} />
  {#snippet failed(error, reset)}
    <strong>{error.message}</strong>
    <button onclick={() => { broken = false; reset(); }}>reset</button>
  {/snippet}
</svelte:boundary>
