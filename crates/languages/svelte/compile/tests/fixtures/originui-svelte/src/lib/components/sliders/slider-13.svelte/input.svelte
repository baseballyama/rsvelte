<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';

	import Volume2 from '@lucide/svelte/icons/volume-2';
	import VolumeX from '@lucide/svelte/icons/volume-x';

	let value = $state(25);
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between gap-2">
		<Label class="leading-6">Volume</Label>
		<output class="text-sm font-medium tabular-nums">{value}</output>
	</div>
	<div class="flex items-center gap-2">
		<VolumeX class="shrink-0 opacity-60" size={16} aria-hidden="true" />
		<Slider type="single" bind:value aria-label="Volume slider" />
		<Volume2 class="shrink-0 opacity-60" size={16} aria-hidden="true" />
	</div>
</div>
