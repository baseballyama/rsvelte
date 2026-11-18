<script>
  let { rows } = $props();
</script>
{#each rows as day}
  <button onclick={() => day = day + 1}>{day}</button>
{/each}
