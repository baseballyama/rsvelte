<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';

	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Circle from '@lucide/svelte/icons/circle';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip';
</script>

<div class="inline-grid w-fit grid-cols-3 gap-1">
	<TooltipProvider delayDuration={0}>
		<Tooltip>
			<TooltipTrigger>
				{#snippet child({ props })}
					<Button
						class="col-start-2"
						variant="outline"
						size="icon"
						aria-label="Pan camera up"
						{...props}
					>
						<ChevronUp size={16} aria-hidden="true" />
					</Button>
				{/snippet}
			</TooltipTrigger>
			<TooltipContent side="top" class="px-2 py-1 text-xs">
				Pan top
				<kbd
					class="border-border bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium"
				>
					⌘T
				</kbd>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
	<TooltipProvider delayDuration={0}>
		<Tooltip>
			<TooltipTrigger>
				{#snippet child({ props })}
					<Button
						class="col-start-1"
						variant="outline"
						size="icon"
						aria-label="Pan camera left"
						{...props}
					>
						<ChevronLeft size={16} aria-hidden="true" />
					</Button>
				{/snippet}
			</TooltipTrigger>
			<TooltipContent side="left" class="px-2 py-1 text-xs">
				Pan left
				<kbd
					class="border-border bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium"
				>
					⌘L
				</kbd>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
	<div class="flex items-center justify-center" aria-hidden="true">
		<Circle class="opacity-60" size={16} />
	</div>
	<TooltipProvider delayDuration={0}>
		<Tooltip>
			<TooltipTrigger>
				{#snippet child({ props })}
					<Button variant="outline" size="icon" aria-label="Pan camera right" {...props}>
						<ChevronRight size={16} aria-hidden="true" />
					</Button>
				{/snippet}
			</TooltipTrigger>
			<TooltipContent side="right" class="px-2 py-1 text-xs">
				Pan right
				<kbd
					class="border-border bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium"
				>
					⌘R
				</kbd>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
	<TooltipProvider delayDuration={0}>
		<Tooltip>
			<TooltipTrigger>
				{#snippet child({ props })}
					<Button
						class="col-start-2"
						variant="outline"
						size="icon"
						aria-label="Pan camera down"
						{...props}
					>
						<ChevronDown size={16} aria-hidden="true" />
					</Button>
				{/snippet}
			</TooltipTrigger>
			<TooltipContent side="bottom" class="px-2 py-1 text-xs">
				Pan bottom
				<kbd
					class="border-border bg-background text-muted-foreground/70 ms-2 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium"
				>
					⌘B
				</kbd>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
</div>
