<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
</script>

<div class="*:not-first:mt-4">
	<Label>Simple slider</Label>
	<Slider type="single" value={25} aria-label="Simple slider" />
</div>
