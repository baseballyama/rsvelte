<svelte:options runes={false} />

<script>
  let n = 0;
  let width = 0;

  function handle() {
    n += 1;
  }
</script>

<svelte:window
  bind:innerWidth={width}
  on:resize={handle}
  on:keydown|preventDefault={handle}
/>
<svelte:document on:visibilitychange={handle} />
<svelte:body on:mouseenter={handle} on:mouseleave={handle} />

<b>{n}{width}</b>
