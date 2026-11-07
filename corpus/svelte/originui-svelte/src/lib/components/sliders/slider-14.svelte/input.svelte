<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
</script>

<div class="*:not-first:mt-4">
	<Label>Slider with multiple thumbs</Label>
	<Slider
		type="multiple"
		value={[25, 50, 100]}
		aria-label="Slider with multiple thumbs"
		showTooltip
		tooltipContent={(value) => `${value}%`}
	/>
</div>
