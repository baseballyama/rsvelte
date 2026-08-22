<script>
  let seed = $state(0);
</script>

<svelte:boundary onerror={(error, reset) => reset()}>
  {#key seed}
    {#if seed >= 0}
      {#each [seed] as item (item)}
        <b>{item}</b>
      {/each}
    {/if}
  {/key}

  {#snippet failed(error, reset)}
    <button onclick={reset}>{error.message}</button>
  {/snippet}
</svelte:boundary>

<button onclick={() => (seed += 1)}>b</button>
