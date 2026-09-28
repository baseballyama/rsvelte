<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';

	const min = 5;
	const max = 1240;

	let value = $state([min, max]);
	const price = $derived(value.map((v) => `$${v.toLocaleString()}${v == max ? '+' : ''}`));
</script>

<div class="*:not-first:mt-3">
	<Label class="tabular-nums">
		From {price[0]} to {price[1]}
	</Label>
	<div class="flex items-center gap-4">
		<Slider type="multiple" bind:value {max} {min} aria-label="Price range slider" />
		<Button variant="outline">Go</Button>
	</div>
</div>
