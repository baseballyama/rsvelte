<script lang="ts">
	export let filters = {
		cpu: { operator: '>' },
		ram: { operator: '<' }
	};
</script>

{#each ['cpu', 'ram'] as type}
	{@const filterKey = type as keyof typeof filters}
	<select bind:value={filters[filterKey].operator}>
		<option value=">">greater</option>
		<option value="<">less</option>
	</select>
{/each}
