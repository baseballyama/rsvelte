<script>
  import { settings } from './settings.js';
</script>

{#each settings.filters as filter, index}
  <input bind:value={filter.match} />
{/each}
