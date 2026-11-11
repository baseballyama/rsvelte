<script>let count = $state(1); let values = $state([2, 3]);</script>
{#snippet label(value)}<b>{value}</b><i>{count}</i>{/snippet}
<button onclick={() => count++}>increment</button>
{@render label(count * 2)}
{#each values as value}
  {#snippet nested(increment)}<p>{value + increment}</p>{/snippet}
  {@render nested(count)}
{/each}
