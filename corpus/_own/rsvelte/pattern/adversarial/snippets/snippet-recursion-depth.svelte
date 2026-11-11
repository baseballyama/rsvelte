<script>
  let leaves = $state(0);
</script>

{#snippet branch(depth, path)}
  {#if depth > 0}
    <ul>
      <li>
        {@render branch(depth - 1, `${path}L`)}
      </li>
      <li>
        {@render branch(depth - 1, `${path}R`)}
      </li>
    </ul>
  {:else}
    <b>{path}</b>
  {/if}
{/snippet}

{@render branch(4, "")}

<button onclick={() => (leaves += 1)}>{leaves}</button>
