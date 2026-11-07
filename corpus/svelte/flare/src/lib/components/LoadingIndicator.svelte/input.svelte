<script lang="ts">
	import { fade } from 'svelte/transition';

	type Props = {
		isLoading: boolean;
	};

	let { isLoading }: Props = $props();
</script>

<div class="bg-muted absolute right-0 bottom-0 left-0 h-px"></div>
{#if isLoading}
	<div
		class="loading-indicator"
		data-testid="loading-indicator"
		transition:fade={{ duration: 200 }}
	></div>
{/if}
