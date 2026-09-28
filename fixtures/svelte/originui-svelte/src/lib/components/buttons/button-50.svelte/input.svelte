<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import CircleIcon from '@lucide/svelte/icons/circle';
</script>

<div class="inline-grid w-fit grid-cols-3 gap-1">
	<Button class="col-start-2" variant="outline" size="icon" aria-label="Pan camera up">
		<ChevronUpIcon size={16} aria-hidden="true" />
	</Button>
	<Button class="col-start-1" variant="outline" size="icon" aria-label="Pan camera left">
		<ChevronLeftIcon size={16} aria-hidden="true" />
	</Button>
	<div class="flex items-center justify-center" aria-hidden="true">
		<CircleIcon class="opacity-60" size={16} />
	</div>
	<Button variant="outline" size="icon" aria-label="Pan camera right">
		<ChevronRightIcon size={16} aria-hidden="true" />
	</Button>
	<Button class="col-start-2" variant="outline" size="icon" aria-label="Pan camera down">
		<ChevronDownIcon size={16} aria-hidden="true" />
	</Button>
</div>
