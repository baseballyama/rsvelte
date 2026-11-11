<script>
  import {
    getAllContexts,
    getContext,
    hasContext,
    onDestroy,
    onMount,
    setContext,
    tick,
    untrack,
  } from "svelte";

  const key = Symbol("k");

  setContext(key, { value: 1 });
  setContext("string-key", 2);

  const fromContext = hasContext(key) ? getContext(key) : null;
  const every = getAllContexts();

  let n = $state(0);

  onMount(() => {
    n += 1;
    return () => {};
  });

  onMount(async () => {
    await tick();
  });

  onDestroy(() => {
    untrack(() => n);
  });

  $effect(() => {
    const snapshot = untrack(() => n);
    void snapshot;
  });
</script>

<b>{fromContext ? fromContext.value : 0}{every.size}{n}</b>
