<script lang="ts" generics="T extends { size: number }">
	interface Props {
		rows: T[];
	}

	let { rows }: Props = $props();
</script>

<ul>
	{#each rows as row}
		<li>{row.size}</li>
	{/each}
</ul>
