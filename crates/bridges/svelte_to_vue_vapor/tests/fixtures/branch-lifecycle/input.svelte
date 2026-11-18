<script>
  let mode = $state(0);
  let element = $state();
  let value = $state('first');
</script>

<button class="next" onclick={() => (mode = (mode + 1) % 3)}>next</button>
{#if mode === 0}
  <input bind:this={element} bind:value={value} />
{:else if mode === 1}
  <p>middle: {value}</p>
{:else}
  <p>last: {value}</p>
{/if}
<output>{element ? 'attached' : 'detached'}: {value}</output>
