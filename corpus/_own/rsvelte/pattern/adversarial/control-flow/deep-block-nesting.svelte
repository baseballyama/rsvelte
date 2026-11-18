<script>
  let rows = $state([1]);
  let flag = $state(true);
  const pending = Promise.resolve(1);
</script>

{#if flag}
  {#each rows as row}
    {#key row}
      {#await pending then value}
        {#if value}
          {#each rows as inner}
            {#key inner}
              {#snippet leaf(depth)}
                {#if depth > 0}
                  {#each rows as deepest}
                    <b>{row}{value}{inner}{deepest}{depth}</b>
                  {/each}
                {:else}
                  <b>bottom</b>
                {/if}
              {/snippet}
              {@render leaf(1)}
              {@render leaf(0)}
            {/key}
          {/each}
        {/if}
      {/await}
    {/key}
  {/each}
{/if}
