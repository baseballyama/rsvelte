<script>
  import {
    untrack,
    tick,
    onMount,
    getContext,
    setContext,
    hasContext,
  } from "svelte";
  import { flushSync } from "svelte";

  let n = $state(1);

  setContext("key", { n: () => n });
  const ctx = hasContext("key") ? getContext("key") : null;

  const snapshot = $derived($state.snapshot({ n }));

  $effect(() => {
    untrack(() => n);
  });

  onMount(async () => {
    await tick();
    flushSync(() => {
      n += 1;
    });
  });
</script>

<b>{n}{snapshot.n}{ctx ? 1 : 0}</b>
