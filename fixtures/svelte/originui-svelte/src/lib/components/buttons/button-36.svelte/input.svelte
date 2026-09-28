<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import PinIcon from '@lucide/svelte/icons/pin';
</script>

<div
	class="divide-primary-foreground/30 inline-flex divide-x rounded-md shadow-2xs rtl:space-x-reverse"
>
	<Button
		class="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
		size="icon"
		aria-label="Options"
	>
		<ChevronDownIcon size={16} aria-hidden="true" />
	</Button>
	<Button class="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10">
		<PinIcon class="-ms-1 opacity-60" size={16} aria-hidden="true" />
		Pinned
	</Button>
</div>
