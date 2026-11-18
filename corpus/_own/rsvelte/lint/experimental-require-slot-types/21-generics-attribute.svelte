<script lang="ts" generics="T extends { id: string }">
	export let rows: T[];
</script>
{#each rows as row (row.id)}
	<slot {row} />
{/each}
