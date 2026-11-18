<script>
  import { onDestroy } from 'svelte';
  const originalRandom = Math.random;
  const originalDate = Date.now;
  const originalPerformance = performance.now;
  let random = 0;
  let clock = 0;
  let timer = 0;
  Math.random = () => ++random / 100;
  Date.now = () => ++clock;
  performance.now = () => ++timer;
  onDestroy(() => {
    Math.random = originalRandom;
    Date.now = originalDate;
    performance.now = originalPerformance;
  });
  let value = $state(0);
  let visible = $state(true);
</script>
<button onclick={() => value++}>change</button>
<button onclick={() => visible = !visible}>toggle</button>
<p title={Math.random()}>{Date.now()}:{performance.now()}:{value}</p>
<p>{Math.random() + value}</p>
{#if visible}<p>{Date.now()}</p>{/if}
