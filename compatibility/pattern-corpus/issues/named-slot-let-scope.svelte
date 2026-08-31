<script>
	import Select from './Select.svelte';

	export let accessLevelsInfoMap;

	function changeAccess(option) {
		return option;
	}
</script>

<Select on:change={(e) => changeAccess(e.detail)} let:option>
	<div slot="trigger">
		{accessLevelsInfoMap.get(option)?.name ?? ''}
	</div>
	{#if option}
		<div>{accessLevelsInfoMap.get(option)?.name ?? ''}</div>
	{/if}
</Select>
