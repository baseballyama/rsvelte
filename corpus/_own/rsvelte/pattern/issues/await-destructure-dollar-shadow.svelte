<script>
  import { readable } from 'svelte/store';

  let { rows = [] } = $props();
  const result = readable(null);
  const promise = Promise.resolve([]);
</script>

<p>{$result}</p>

{#await promise then [$result]}
  <p>{$result}</p>
  {#each rows as $row}
    <span>{$row}</span>
  {/each}
{/await}

{#snippet show($value)}
  <strong>{$value}</strong>
{/snippet}
