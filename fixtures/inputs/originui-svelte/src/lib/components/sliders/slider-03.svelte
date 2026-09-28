<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
</script>

<div class="*:not-first:mt-4">
	<Label>Slider with square thumb</Label>
	<Slider
		type="single"
		value={25}
		max={100}
		step={5}
		class="*:data-slider-thumb:rounded"
		aria-label="Slider with square thumb"
	/>
</div>
