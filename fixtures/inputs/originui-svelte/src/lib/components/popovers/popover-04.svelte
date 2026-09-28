<script>
	import Button from '$lib/components/ui/button.svelte';

	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
</script>

<Popover>
	<PopoverTrigger>
		{#snippet child({ props })}
			<Button variant="outline" {...props}>Tooltip-like popover</Button>
		{/snippet}
	</PopoverTrigger>
	<PopoverContent class="max-w-[280px] py-3 shadow-none" side="top">
		<div class="space-y-3">
			<div class="space-y-1">
				<p class="text-[13px] font-medium">Popover with button</p>
				<p class="text-muted-foreground text-xs">
					I am a popover that would like to look like a tooltip. I can&lsquo;t be a tooltip because
					of the interactive element inside me.
				</p>
			</div>
			<Button size="sm" class="h-7 px-2">Know more</Button>
		</div>
	</PopoverContent>
</Popover>
