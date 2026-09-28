<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import FlipHorizontalIcon from '@lucide/svelte/icons/flip-horizontal';
	import FlipVerticalIcon from '@lucide/svelte/icons/flip-vertical';
</script>

<div class="inline-flex -space-x-px rounded-md shadow-2xs rtl:space-x-reverse">
	<Button
		class="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
		variant="outline"
		size="icon"
		aria-label="Flip Horizontal"
	>
		<FlipHorizontalIcon size={16} aria-hidden="true" />
	</Button>
	<Button
		class="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
		variant="outline"
		size="icon"
		aria-label="Flip Vertical"
	>
		<FlipVerticalIcon size={16} aria-hidden="true" />
	</Button>
</div>
