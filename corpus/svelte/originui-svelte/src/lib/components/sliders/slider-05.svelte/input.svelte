<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
</script>

<div class="*:not-first:mt-4">
	<Label>Slider with tiny thumb</Label>
	<Slider
		type="single"
		value={25}
		class="*:data-slider-thumb:border-background *:data-slider-thumb:bg-primary *:data-slider-thumb:h-6 *:data-slider-thumb:w-2.5 *:data-slider-thumb:border-[3px] *:data-slider-thumb:ring-offset-0"
		aria-label="Slider with tiny thumb"
	/>
</div>
