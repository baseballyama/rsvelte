<script>
  let count = $state(0);
  let element = $state();
  $effect(() => {
    const current = count;
    element.setAttribute('data-run', String(current));
    return () => element.setAttribute('data-clean', String(current));
  });
</script>

<button onclick={() => { count++; count++; }}>change</button>
<p>{count}</p>
<output bind:this={element}>effect</output>
