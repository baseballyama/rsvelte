<script lang="ts">
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
	import { useSliderWithInput } from '$lib/hooks/use-slider-with-input.svelte';

	const minValue = 0;
	const maxValue = 100;
	const initialValue = [25];

	const slider = useSliderWithInput({ initialValue, maxValue, minValue });
</script>

<div class="*:not-first:mt-3">
	<Label>Slider with input</Label>
	<div class="flex items-center gap-4">
		<Slider
			type="single"
			class="grow"
			bind:value={slider.sliderValue[0]}
			onValueChange={slider.handleSliderChange}
			min={minValue}
			max={maxValue}
			aria-label="Slider with input"
		/>
		<Input
			class="h-8 w-12 [appearance:textfield] px-2 py-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
			type="number"
			inputmode="decimal"
			min={minValue}
			max={maxValue}
			bind:value={slider.inputValues[0]}
			oninput={(e) => slider.handleInputChange(e, 0)}
			onblur={() => slider.validateAndUpdateValue(slider.inputValues[0], 0)}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					slider.validateAndUpdateValue(slider.inputValues[0], 0);
				}
			}}
			aria-label="Enter value"
		/>
	</div>
</div>
