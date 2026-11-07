<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';

	let isExpanded = $state(false);

	function toggleExpand() {
		isExpanded = !isExpanded;
	}
</script>

<Button
	class="gap-1"
	variant="ghost"
	onclick={toggleExpand}
	aria-expanded={isExpanded}
	aria-controls="expandable-content"
>
	{#if isExpanded}
		Show less
		<ChevronUpIcon className="-me-1" size={16} stroke-width="2" aria-hidden="true" />
	{:else}
		Show more
		<ChevronDownIcon className="-me-1" size={16} stroke-width="2" aria-hidden="true" />
	{/if}
</Button>
