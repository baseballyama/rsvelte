<script>
  let cond = true;
  let xs = [1];
</script>

{#if cond}
  <style>a { color: red; }</style>
{/if}
{#each xs as x (x)}
  <style>b { color: blue; }</style>
{/each}
{#snippet s()}
  <style>i { color: green; }</style>
{/snippet}
{@render s()}
