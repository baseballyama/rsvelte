<script>
  let value = $state(0);
</script>
<button onclick={() => value++}>change</button>
{#if await Promise.resolve(value % 3 === 0)}
  <p>zero:{value}</p>
{:else if await Promise.resolve(value % 3 === 1)}
  <p>one:{value}</p>
{:else}
  <p>two:{value}</p>
{/if}
{#each await Promise.resolve(value % 2 ? [value] : []) as item}
  <strong>{item}</strong>
{:else}
  <em>empty</em>
{/each}
{#key await Promise.resolve(value)}
  <input value={value} />
{/key}
