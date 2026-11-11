<script>
  let xs = [1];
  let ok = true;
</script>

{#if ok}
  <window>in if</window>
{/if}
{#each xs as x (x)}
  <p>アイテム🍣</p><element>multibyte before on same line</element>
{/each}
{#snippet s()}
  <options>in snippet</options>
{/snippet}
{@render s()}
