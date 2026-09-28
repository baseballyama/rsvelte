import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import { useSliderWithInput } from '$lib/hooks/use-slider-with-input.svelte';

var root = $.from_html(`<div class="*:not-first:mt-3"><!> <div class="flex items-center gap-4"><!> <!> <!></div></div>`);

export default function Slider_19($$anchor, $$props) {
	$.push($$props, true);

	const minValue = 0;
	const maxValue = 200;
	const initialValue = [50, 150];
	const slider = useSliderWithInput({ initialValue, maxValue, minValue });
	var div = root();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Dual range slider with input');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Input(node_1, {
		class: 'h-8 w-12 px-2 py-1',
		type: 'text',
		inputmode: 'decimal',
		get value() {
			return slider.inputValues[0];
		},
		onchange: (e) => slider.handleInputChange(e, 0),
		onblur: () => slider.validateAndUpdateValue(slider.inputValues[0], 0),
		onkeydown: (e) => {
			if (e.key === 'Enter') {
				slider.validateAndUpdateValue(slider.inputValues[0], 0);
			}
		},
		'aria-label': 'Enter minimum value'
	});

	var node_2 = $.sibling(node_1, 2);

	Slider(node_2, {
		type: 'multiple',
		class: 'grow',
		get onValueChange() {
			return slider.handleSliderChange;
		},
		min: minValue,
		max: maxValue,
		'aria-label': 'Dual range slider with input',
		get value() {
			return slider.sliderValue;
		},

		set value($$value) {
			slider.sliderValue = $$value;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Input(node_3, {
		class: 'h-8 w-12 px-2 py-1',
		type: 'text',
		inputmode: 'decimal',
		get value() {
			return slider.inputValues[1];
		},
		onchange: (e) => slider.handleInputChange(e, 1),
		onblur: () => slider.validateAndUpdateValue(slider.inputValues[1], 1),
		onkeydown: (e) => {
			if (e.key === 'Enter') {
				slider.validateAndUpdateValue(slider.inputValues[1], 1);
			}
		},
		'aria-label': 'Enter maximum value'
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}