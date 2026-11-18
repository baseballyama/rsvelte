<script>
  let { rows } = $props();

  const grid = $derived.by(() => {
    const result = [];
    for (let day = 1; day <= 31; day++) {
      day = day + 1;
      result.push(day);
    }
    return result;
  });
</script>

{#each rows as day}
  <span>{day}</span>
{/each}
