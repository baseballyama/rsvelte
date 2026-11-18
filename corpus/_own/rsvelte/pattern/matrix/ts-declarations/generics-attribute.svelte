<script lang="ts" generics="T extends { id: string }">
	let { items }: { items: T[] } = $props();
</script>

<ul>
	{#each items as item (item.id)}
		<li>{item.id}</li>
	{/each}
</ul>
