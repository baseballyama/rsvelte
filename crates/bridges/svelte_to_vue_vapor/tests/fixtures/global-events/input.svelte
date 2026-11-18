<script>
  let count = $state(0);
  let width = $state();
  function pressed() { count++; }
</script>
<svelte:window bind:innerWidth={width} onkeydown={pressed} />
<svelte:document onmousedown={pressed} />
<svelte:body onkeyup={pressed} />
<p>{count}:{width}</p>
<button onclick={() => count++}>increment</button>
