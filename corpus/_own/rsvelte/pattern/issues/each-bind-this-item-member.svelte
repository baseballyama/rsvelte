<script>
  import Widget from './Widget.svelte';

  let rows = $state([
    { component: undefined, element: undefined },
    { component: undefined, element: undefined }
  ]);
</script>

{#each rows as row}
  <div bind:this={row.element}></div>
{/each}

{#each rows as row}
  <Widget bind:this={row.component} />
{/each}
