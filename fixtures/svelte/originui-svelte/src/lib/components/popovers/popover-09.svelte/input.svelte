<script lang="ts">
	import type { Icon as IconType } from '@lucide/svelte';

	import Button from '../ui/button.svelte';

	import Club from '@lucide/svelte/icons/club';
	import Diamond from '@lucide/svelte/icons/diamond';
	import Heart from '@lucide/svelte/icons/heart';
	import Spade from '@lucide/svelte/icons/spade';

	import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

	interface TourStep {
		description: string;
		icon: typeof IconType;
		title: string;
	}

	const tourSteps: TourStep[] = [
		{
			description:
				"This is your new workspace. Here you'll find all your projects, recent activities, settings, and more.",
			icon: Heart,
			title: 'Heart'
		},
		{
			description:
				'Use the toolbar above to create new projects, invite team members, or access settings.',
			icon: Diamond,
			title: 'Diamond'
		},
		{
			description:
				'Click the support icon in the top right corner to access our help center and documentation.',
			icon: Club,
			title: 'Club'
		},
		{
			description:
				'Press ⌘K to open the command palette. Use arrow keys to navigate and Enter to select an action.',
			icon: Spade,
			title: 'Spade'
		}
	];

	let currentStep = $state(0);
	let anchors = $state<HTMLDivElement[]>([]);

	function handleNavigation() {
		if (currentStep === tourSteps.length - 1) {
			currentStep = 0;
		} else {
			currentStep++;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<Popover
		onOpenChange={(open) => {
			if (open) currentStep = 0;
		}}
	>
		<div class="grid grid-cols-2 place-items-center gap-4">
			{#each tourSteps as _, index (index)}
				<div
					class="bg-secondary text-muted-foreground flex size-10 items-center justify-center rounded-lg text-sm font-medium"
					bind:this={anchors[index]}
				>
					{index + 1}
				</div>
			{/each}
		</div>

		<PopoverTrigger>
			{#snippet child({ props })}
				<Button variant="outline" {...props}>Start tour</Button>
			{/snippet}
		</PopoverTrigger>

		<PopoverContent
			class="max-w-[280px] py-3 shadow-none"
			side={currentStep % 2 === 0 ? 'left' : 'right'}
			customAnchor={anchors[currentStep]}
			showArrow={true}
		>
			<div class="space-y-3">
				<div class="space-y-1">
					<p class="text-[13px] font-medium">{tourSteps[currentStep].title}</p>
					<p class="text-muted-foreground text-xs">{tourSteps[currentStep].description}</p>
				</div>
				<div class="flex items-center justify-between gap-2">
					<span class="text-muted-foreground text-xs">
						{currentStep + 1}/{tourSteps.length}
					</span>
					<button class="text-xs font-medium hover:underline" onclick={handleNavigation}>
						{currentStep === tourSteps.length - 1 ? 'Start over' : 'Next'}
					</button>
				</div>
			</div>
		</PopoverContent>
	</Popover>
</div>
