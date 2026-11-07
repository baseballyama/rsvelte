<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
</script>

<div class="*:not-first:mt-4">
	<Label>Dual range slider</Label>
	<Slider type="multiple" value={[25, 75]} step={5} aria-label="Dual range slider" />
</div>
