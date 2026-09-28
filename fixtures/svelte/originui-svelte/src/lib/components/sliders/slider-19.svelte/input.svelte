<script lang="ts">
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
	import { useSliderWithInput } from '$lib/hooks/use-slider-with-input.svelte';

	const minValue = 0;
	const maxValue = 200;
	const initialValue = [50, 150];

	const slider = useSliderWithInput({ initialValue, maxValue, minValue });
</script>

<div class="*:not-first:mt-3">
	<Label>Dual range slider with input</Label>
	<div class="flex items-center gap-4">
		<Input
			class="h-8 w-12 px-2 py-1"
			type="text"
			inputmode="decimal"
			value={slider.inputValues[0]}
			onchange={(e) => slider.handleInputChange(e, 0)}
			onblur={() => slider.validateAndUpdateValue(slider.inputValues[0], 0)}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					slider.validateAndUpdateValue(slider.inputValues[0], 0);
				}
			}}
			aria-label="Enter minimum value"
		/>
		<Slider
			type="multiple"
			class="grow"
			bind:value={slider.sliderValue}
			onValueChange={slider.handleSliderChange}
			min={minValue}
			max={maxValue}
			aria-label="Dual range slider with input"
		/>
		<Input
			class="h-8 w-12 px-2 py-1"
			type="text"
			inputmode="decimal"
			value={slider.inputValues[1]}
			onchange={(e) => slider.handleInputChange(e, 1)}
			onblur={() => slider.validateAndUpdateValue(slider.inputValues[1], 1)}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					slider.validateAndUpdateValue(slider.inputValues[1], 1);
				}
			}}
			aria-label="Enter maximum value"
		/>
	</div>
</div>
