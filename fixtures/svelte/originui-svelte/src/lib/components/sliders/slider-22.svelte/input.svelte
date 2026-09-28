<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
</script>

<div class="*:not-first:mt-4">
	<Label>Vertical slider</Label>
	<div class="flex h-40 justify-center">
		<Slider type="single" value={5} max={10} orientation="vertical" aria-label="Vertical slider" />
	</div>
</div>
