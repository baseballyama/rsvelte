import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import { useSliderWithInput } from '$lib/hooks/use-slider-with-input.svelte';

export default function Slider_19($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const minValue = 0;
		const maxValue = 200;
		const initialValue = [50, 150];
		const slider = useSliderWithInput({ initialValue, maxValue, minValue });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="*:not-first:mt-3">`);

			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dual range slider with input`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex items-center gap-4">`);

			Input($$renderer, {
				class: 'h-8 w-12 px-2 py-1',
				type: 'text',
				inputmode: 'decimal',
				value: slider.inputValues[0],
				onchange: (e) => slider.handleInputChange(e, 0),
				onblur: () => slider.validateAndUpdateValue(slider.inputValues[0], 0),
				onkeydown: (e) => {
					if (e.key === 'Enter') {
						slider.validateAndUpdateValue(slider.inputValues[0], 0);
					}
				},
				'aria-label': 'Enter minimum value'
			});

			$$renderer.push(`<!----> `);

			Slider($$renderer, {
				type: 'multiple',
				class: 'grow',
				onValueChange: slider.handleSliderChange,
				min: minValue,
				max: maxValue,
				'aria-label': 'Dual range slider with input',
				get value() {
					return slider.sliderValue;
				},

				set value($$value) {
					slider.sliderValue = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				class: 'h-8 w-12 px-2 py-1',
				type: 'text',
				inputmode: 'decimal',
				value: slider.inputValues[1],
				onchange: (e) => slider.handleInputChange(e, 1),
				onblur: () => slider.validateAndUpdateValue(slider.inputValues[1], 1),
				onkeydown: (e) => {
					if (e.key === 'Enter') {
						slider.validateAndUpdateValue(slider.inputValues[1], 1);
					}
				},
				'aria-label': 'Enter maximum value'
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}