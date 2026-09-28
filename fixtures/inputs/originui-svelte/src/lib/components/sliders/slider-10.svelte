<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
</script>

<div class="*:not-first:mt-4">
	<Label>Slider with labels and tooltip</Label>
	<div>
		<span
			class="text-muted-foreground mb-3 flex w-full items-center justify-between gap-2 text-xs font-medium"
			aria-hidden="true"
		>
			<span>Low</span>
			<span>High</span>
		</span>
		<Slider
			type="single"
			value={50}
			step={10}
			showTooltip
			aria-label="Slider with labels and tooltip"
		/>
	</div>
</div>
