<script>
	let items = [1, 2, 3];
	function getItems() {
		return items;
	}
</script>

{#each items}
	<span>x</span>
{/each}
{#each getItems()}
	<span>y</span>
{/each}
{#each { length: 3 }}
	<span>z</span>
{/each}
