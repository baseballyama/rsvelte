<script>
  import { onMount, onDestroy, tick, untrack } from 'svelte';
  let count = $state(0);
  let trigger = $state(0);
  let observed = $state(-1);
  let mounted = $state(false);
  onMount(() => {
    mounted = true;
    return () => { document.title = 'cleanup'; };
  });
  onDestroy(() => { if (typeof document !== 'undefined') document.title = 'destroyed'; });
  $effect(() => {
    trigger;
    observed = untrack(() => count);
  });
  async function update() { count++; await tick(); }
</script>
<button onclick={update}>count</button>
<button onclick={() => trigger++}>trigger</button>
<p>{mounted}:{count}:{observed}</p>
