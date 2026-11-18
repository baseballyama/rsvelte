<script>
	let items = $state();
</script>
{#each items as item}
  <p>{item.name} costs ${item.price}</p>
{/each}
{#each items as item (item.id)}
  <p>{item.name} costs ${item.price}</p>
{/each}