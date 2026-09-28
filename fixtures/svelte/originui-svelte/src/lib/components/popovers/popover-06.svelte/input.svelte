<script>
	import Button from '$lib/components/ui/button.svelte';

	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

	const tips = [
		{
			description:
				"This is your new workspace. Here you'll find all your projects, recent activities, settings, and more.",
			title: 'Welcome to Dashboard'
		},
		{
			description:
				'Use the toolbar above to create new projects, invite team members, or access settings.',
			title: 'Quick Actions'
		},
		{
			description:
				'Click the support icon in the top right corner to access our help center and documentation.',
			title: 'Need Help?'
		},
		{
			description:
				'Press ⌘K to open the command palette. Use arrow keys to navigate and Enter to select an action.',
			title: 'Keyboard Shortcuts'
		},
		{
			description:
				'Enable notifications to receive updates about your projects, team activity, and important deadlines.',
			title: 'Stay Updated'
		}
	];

	let currentTip = $state(0);

	function handleNext() {
		if (currentTip < tips.length - 1) {
			currentTip++;
		}
	}

	function handlePrev() {
		if (currentTip > 0) {
			currentTip--;
		}
	}

	const isFirstTip = $derived(currentTip === 0);
	const isLastTip = $derived(currentTip === tips.length - 1);
</script>

<Popover>
	<PopoverTrigger>
		{#snippet child({ props })}
			<Button variant="outline" {...props}>Tooltip-like with steps</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent class="max-w-[280px] py-3 shadow-none" side="top">
		<div class="space-y-3">
			<div class="space-y-1">
				<p class="text-[13px] font-medium">{tips[currentTip].title}</p>
				<p class="text-muted-foreground text-xs">{tips[currentTip].description}</p>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-muted-foreground text-xs">
					{currentTip + 1}/{tips.length}
				</span>
				<div class="flex gap-0.5">
					<Button
						size="icon"
						variant="ghost"
						class="size-6"
						onclick={handlePrev}
						disabled={isFirstTip}
						aria-label="Previous tip"
					>
						<ArrowLeft size={14} aria-hidden="true" />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						class="size-6"
						onclick={handleNext}
						disabled={isLastTip}
						aria-label="Next tip"
					>
						<ArrowRight size={14} aria-hidden="true" />
					</Button>
				</div>
			</div>
		</div>
	</PopoverContent>
</Popover>
