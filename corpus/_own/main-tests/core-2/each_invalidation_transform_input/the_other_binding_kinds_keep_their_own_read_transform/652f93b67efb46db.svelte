<script>
  export let settings;
</script>

<input bind:value={settings.language} />

{#each settings.filters as filter, index}
  <input bind:value={filter.match} />
{/each}
