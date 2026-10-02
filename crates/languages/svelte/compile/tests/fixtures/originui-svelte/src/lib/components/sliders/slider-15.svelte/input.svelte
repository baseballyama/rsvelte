<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Slider from '$lib/components/ui/slider.svelte';
	import {
		Tooltip,
		TooltipContent,
		TooltipProvider,
		TooltipTrigger
	} from '$lib/components/ui/tooltip/index.js';
	import { useSliderWithInput } from '$lib/hooks/use-slider-with-input.svelte';

	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { cn } from '$lib/utils';

	const minValue = 0;
	const maxValue = 2;
	const initialValue = [1.25];
	const defaultValue = [1];

	const slider = useSliderWithInput({ defaultValue, initialValue, maxValue, minValue });
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between gap-2">
		<Label>Temperature</Label>
		<div class="flex items-center gap-1">
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger>
						{#snippet child({ props })}
							<Button
								size="icon"
								variant="ghost"
								class={cn(
									'size-7 transition-opacity',
									slider.showReset ? 'opacity-100' : 'opacity-0'
								)}
								aria-label="Reset"
								{...props}
								onclick={slider.resetToDefault}
							>
								<RotateCcw size={16} aria-hidden="true" />
							</Button>
						{/snippet}
					</TooltipTrigger>
					<TooltipContent class="px-2 py-1 text-xs">Reset to default</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<Input
				class="h-7 w-12 px-2 py-0"
				type="text"
				inputmode="decimal"
				value={slider.inputValues[0]}
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
	<div class="flex items-center gap-4">
		<Slider
			type="multiple"
			class="grow"
			bind:value={slider.sliderValue}
			onValueChange={slider.handleSliderChange}
			min={minValue}
			max={maxValue}
			step={0.01}
			aria-label="Temperature"
		/>
	</div>
</div>
