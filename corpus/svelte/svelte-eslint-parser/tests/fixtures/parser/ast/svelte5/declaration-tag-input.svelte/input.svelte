<script>
  const boxes = [
    { width: 10, height: 20 },
    { width: 5, height: 5 },
  ];
  function format(value) {
    return `${value} square pixels`;
  }
</script>
{#each boxes as box}
  {const area = box.width * box.height}
  {let label = `${area} square pixels`}

  <p>{format(area)} ({label})</p>
{/each}
