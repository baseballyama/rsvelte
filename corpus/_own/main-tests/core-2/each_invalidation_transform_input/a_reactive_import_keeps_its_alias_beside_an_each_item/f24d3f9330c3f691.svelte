<script>
  import { settings } from './settings.js';
</script>

<input bind:value={settings.language} />

{#each settings.filters as filter}
  {#each filter.rules as rule}
    <input bind:value={rule.match} />
  {/each}
{/each}
