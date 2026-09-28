<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import Globe from '@lucide/svelte/icons/globe';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip';
</script>

<TooltipProvider delayDuration={0}>
	<Tooltip>
		<TooltipTrigger>
			{#snippet child({ props })}
				<Button variant="outline" size="sm" {...props}>W/ icon</Button>
			{/snippet}
		</TooltipTrigger>
		<TooltipContent class="dark py-3"
			><div class="flex gap-3">
				<Globe class="mt-0.5 shrink-0 opacity-60" size={16} aria-hidden="true" />
				<div class="space-y-1">
					<p class="text-[13px] font-medium">Tooltip with title and icon</p>
					<p class="text-muted-foreground text-xs">
						Tooltips are made to be highly customizable, with features like dynamic placement, rich
						content, and a robust API.
					</p>
				</div>
			</div></TooltipContent
		>
	</Tooltip>
</TooltipProvider>
