<script>
  import { settings } from './settings.js';
</script>

<input bind:value={settings.language} />

{#each settings.filters as filter, index}
  <input bind:value={filter.match} />
{/each}
