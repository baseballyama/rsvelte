<script>
  let { rows } = $props();
  function build() {
    for (let day = 0; day < 10; day++) {
      day = day + 2;
    }
  }
</script>
{#each rows as day}<span>{day}</span>{/each}
