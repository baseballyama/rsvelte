<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';

	const labels = ['Awful', 'Poor', 'Okay', 'Good', 'Amazing'];

	let value = $state(3);
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between gap-2">
		<Label class="leading-6">Rate your experience</Label>
		<span class="text-sm font-medium">{labels[value - 1]}</span>
	</div>
	<div class="flex items-center gap-2">
		<span class="text-2xl">😡</span>
		<Slider type="single" bind:value min={1} max={5} aria-label="Rate your experience" />
		<span class="text-2xl">😍</span>
	</div>
</div>
