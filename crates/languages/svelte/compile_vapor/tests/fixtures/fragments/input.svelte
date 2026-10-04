<script>
  let visible = $state(true);
  let items = $state([1, 2]);
</script>

<button class="toggle" onclick={() => (visible = !visible)}>toggle</button>
<button class="clear" onclick={() => (items = [])}>clear</button>
{#if visible}
  start <b>bold</b><i>italic</i> end
{:else}
  hidden <span>text</span>
{/if}
{#each items as item}
  {item}<b>{item * 2}</b><i>{item * 3}</i>
{:else}
  empty <em>list</em>
{/each}
