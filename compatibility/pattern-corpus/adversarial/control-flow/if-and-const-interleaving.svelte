<script>
  let n = $state(2);
</script>

{#if n > 1}
  {@const doubled = n * 2}
  {#if doubled > 3}
    {@const tripled = doubled + n}
    <b>{tripled}</b>
  {:else if doubled > 1}
    <b>{doubled}</b>
  {:else}
    <b>none</b>
  {/if}
{:else if n === 1}
  <b>one</b>
{:else}
  <b>zero</b>
{/if}

{#each [n] as item}
  {@const shadow = item}
  {#if shadow}
    {@const shadow2 = shadow + 1}
    <b>{shadow2}</b>
  {/if}
{/each}
