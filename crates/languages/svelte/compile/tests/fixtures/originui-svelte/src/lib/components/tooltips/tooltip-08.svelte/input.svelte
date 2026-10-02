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
				<Button variant="outline" size="sm" {...props}>Stats</Button>
			{/snippet}
		</TooltipTrigger>
		<TooltipContent class=" py-3"
			><ul class="grid gap-3 text-xs">
				<li class="grid gap-0.5">
					<span class="text-muted-foreground">Status</span>
					<span class="font-medium">Completed</span>
				</li>
				<li class="grid gap-0.5">
					<span class="text-muted-foreground">Code Coverage</span>
					<span class="font-medium">94.3%</span>
				</li>
				<li class="grid gap-0.5">
					<span class="text-muted-foreground">Last Deploy</span>
					<span class="font-medium">Today at 15:42</span>
				</li>
				<li class="grid gap-0.5">
					<span class="text-muted-foreground">Performance Score</span>
					<span class="font-medium">98/100</span>
				</li>
			</ul></TooltipContent
		>
	</Tooltip>
</TooltipProvider>
