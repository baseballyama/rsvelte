<script lang="ts">
	import Toggle from '$lib/components/ui/toggle.svelte';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip/index.js';

	import Bookmark from '@lucide/svelte/icons/bookmark';

	let bookmarked = $state(false);
</script>

<TooltipProvider>
	<Tooltip>
		<TooltipTrigger aria-label="Bookmark this">
			{#snippet child({ props })}
				<Toggle
					class="group size-9 p-0 hover:bg-indigo-50 hover:text-indigo-500 data-[state=on]:bg-indigo-50 data-[state=on]:text-indigo-500"
					pressed={bookmarked}
					onPressedChange={() => (bookmarked = !bookmarked)}
					{...props}
				>
					<Bookmark size={16} aria-hidden="true" {...props} />
				</Toggle>
			{/snippet}
		</TooltipTrigger>
		<TooltipContent class="px-2 py-1 text-xs">
			<p>{bookmarked ? 'Remove bookmark' : 'Bookmark this'}</p>
		</TooltipContent>
	</Tooltip>
</TooltipProvider>
