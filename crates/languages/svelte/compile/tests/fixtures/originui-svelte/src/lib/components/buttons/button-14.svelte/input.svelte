<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	let isLoading = $state(false);

	function handleClick() {
		isLoading = true;
		// Simulate an async operation
		setTimeout(() => {
			isLoading = false;
		}, 1000); // Reset after 1 second
	}
</script>

<Button
	onclick={handleClick}
	disabled={isLoading}
	data-loading={isLoading}
	class="group relative disabled:opacity-100"
>
	<span class="group-data-[loading=true]:text-transparent">Click me</span>
	{#if isLoading}
		<div class="absolute inset-0 flex items-center justify-center">
			<LoaderCircle class="animate-spin" size={16} aria-hidden="true" />
		</div>
	{/if}
</Button>
