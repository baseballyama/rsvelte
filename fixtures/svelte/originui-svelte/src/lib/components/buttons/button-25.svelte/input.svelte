<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
</script>

<div class="inline-flex -space-x-px rounded-md shadow-2xs rtl:space-x-reverse">
	<Button
		class="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
		variant="outline"
		size="icon"
		aria-label="Upvote"
	>
		<ChevronUp size={16} aria-hidden="true" />
	</Button>
	<span class="border-input flex items-center border px-3 text-sm font-medium">235</span>
	<Button
		class="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10"
		variant="outline"
		size="icon"
		aria-label="Downvote"
	>
		<ChevronDown size={16} aria-hidden="true" />
	</Button>
</div>
