<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
	import { cn } from '$lib/utils.js';

	const max = 12;
	const skipInterval = 2; // Set to 1 to allow no text skipping
	const ticks = [...Array(max + 1)].map((_, i) => i);
</script>

<div class="*:not-first:mt-4">
	<Label>Slider with ticks</Label>
	<div>
		<Slider type="single" value={5} {max} step={ticks} aria-label="Slider with ticks" />
		<span
			class="text-muted-foreground mt-3 flex w-full items-center justify-between gap-1 px-2.5 text-xs font-medium"
			aria-hidden="true"
		>
			{#each ticks as _, index (index)}
				<span class="flex w-0 flex-col items-center justify-center gap-2">
					<span class={cn('bg-muted-foreground/70 h-1 w-px', index % skipInterval !== 0 && 'h-0.5')}
					></span>
					<span class={cn(index % skipInterval !== 0 && 'opacity-0')}>{index}</span>
				</span>
			{/each}
		</span>
	</div>
</div>
