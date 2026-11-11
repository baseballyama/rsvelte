<script>
  let items = [1, 2];
  let cond = true;
</script>

{#if cond}
  <button class="x" on:click={() => {}}>missing with attrs</button>
{:else}
  <button disabled>missing too</button>
{/if}
{#each items as item (item)}
  <button data-id={item}>missing in each</button>
{/each}
{#snippet chip()}
  <button>missing in snippet</button>
{/snippet}
{@render chip()}
