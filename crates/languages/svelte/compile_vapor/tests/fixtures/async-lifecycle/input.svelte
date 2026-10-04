<script>
  import { onMount, onDestroy } from 'svelte';
  let mounted = $state(false);
  let observed = $state(-1);
  const value = await Promise.resolve(2);
  onMount(() => { mounted = true; return () => { document.title = 'cleanup'; }; });
  onDestroy(() => { if (typeof document !== 'undefined') document.title = 'destroyed'; });
  $effect(() => { observed = mounted ? value : 0; });
</script>
<p>{value}:{mounted}:{observed}</p>
