<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
</script>

<div class="space-y-4">
	<legend class="text-foreground text-sm font-medium">Equalizer</legend>
	<div class="flex h-48 justify-center gap-8">
		<div class="flex flex-col items-center gap-2">
			<Slider
				type="single"
				value={2}
				min={-5}
				max={5}
				orientation="vertical"
				class="*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded"
				aria-label="60 Hz"
				showTooltip
			/>
			<Label class="text-muted-foreground flex w-0 justify-center text-xs">60</Label>
		</div>
		<div class="flex flex-col items-center gap-2">
			<Slider
				type="single"
				value={1}
				min={-5}
				max={5}
				orientation="vertical"
				class="*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded"
				aria-label="250 Hz"
				showTooltip
			/>
			<Label class="text-muted-foreground flex w-0 justify-center text-xs">250</Label>
		</div>
		<div class="flex flex-col items-center gap-2">
			<Slider
				type="single"
				value={-1}
				min={-5}
				max={5}
				orientation="vertical"
				class="*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded"
				aria-label="1k"
				showTooltip
			/>
			<Label class="text-muted-foreground flex w-0 justify-center text-xs">1k</Label>
		</div>
		<div class="flex flex-col items-center gap-2">
			<Slider
				type="single"
				value={-3}
				min={-5}
				max={5}
				orientation="vertical"
				class="*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded"
				aria-label="4k"
				showTooltip
			/>
			<Label class="text-muted-foreground flex w-0 justify-center text-xs">4k</Label>
		</div>
		<div class="flex flex-col items-center gap-2">
			<Slider
				type="single"
				value={2}
				min={-5}
				max={5}
				orientation="vertical"
				class="*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded"
				aria-label="16k"
				showTooltip
			/>
			<Label class="text-muted-foreground flex w-0 justify-center text-xs">16K</Label>
		</div>
	</div>
</div>
