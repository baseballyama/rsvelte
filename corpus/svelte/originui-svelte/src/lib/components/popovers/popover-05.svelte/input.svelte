<script>
	import Button from '$lib/components/ui/button.svelte';

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
		}
	];

	let currentTip = $state(0);

	function handleNavigation() {
		if (currentTip === tips.length - 1) {
			currentTip = 0;
		} else {
			currentTip++;
		}
	}
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
			<div class="flex items-center justify-between gap-2">
				<span class="text-muted-foreground text-xs">
					{currentTip + 1}/{tips.length}
				</span>
				<button class="text-xs font-medium hover:underline" onclick={handleNavigation}>
					{currentTip === tips.length - 1 ? 'Start over' : 'Next'}
				</button>
			</div>
		</div>
	</PopoverContent>
</Popover>
