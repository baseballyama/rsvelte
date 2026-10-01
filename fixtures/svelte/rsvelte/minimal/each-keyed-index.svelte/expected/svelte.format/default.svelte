<script>
  let rows = $state([{ id: "a" }, { id: "b" }]);
</script>

<div>
  {#each rows as row, index (row.id)}
    <span>{index}: {row.id}</span>
  {/each}
</div>
<p>after</p>
