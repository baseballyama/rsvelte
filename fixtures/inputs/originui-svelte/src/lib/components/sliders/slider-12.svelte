<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';

	let value = $state([25, 75]);
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-2">
		<Label class="leading-6">Dual range slider with output</Label>
		<output class="text-sm font-medium tabular-nums">
			{value[0]} - {value[1]}
		</output>
	</div>
	<Slider type="multiple" bind:value aria-label="Dual range slider with output" />
</div>
