<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

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
				<Button variant="outline" size="sm" {...props}>W/ title</Button>
			{/snippet}
		</TooltipTrigger>
		<TooltipContent class="py-3"
			><div class="space-y-1">
				<p class="text-[13px] font-medium">Tooltip with title</p>
				<p class="text-muted-foreground text-xs">
					Tooltips are made to be highly customizable, with features like dynamic placement, rich
					content, and a robust API. You can even use them as a full-featured dropdown menu by
					setting the <code>trigger</code> prop to <code>click</code>.
				</p>
			</div></TooltipContent
		>
	</Tooltip>
</TooltipProvider>
