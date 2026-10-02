import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import { useSliderWithInput } from '$lib/hooks/use-slider-with-input.svelte';

var root = $.from_html(`<div class="*:not-first:mt-4"><!> <div class="flex h-40 flex-col items-center justify-center gap-4"><!> <!></div></div>`);

export default function Slider_23($$anchor, $$props) {
	$.push($$props, true);

	const minValue = 0;
	const maxValue = 100;
	const initialValue = [25];
	const slider = useSliderWithInput({ initialValue, maxValue, minValue });
	var div = root();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Vertical slider with input');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Slider(node_1, {
		type: 'single',
		class: 'data-[orientation=vertical]:min-h-0',
		orientation: 'vertical',
		get onValueChange() {
			return slider.handleSliderChange;
		},
		min: minValue,
		max: maxValue,
		'aria-label': 'Slider with input',
		get value() {
			return slider.sliderValue[0];
		},

		set value($$value) {
			slider.sliderValue[0] = $$value;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Input(node_2, {
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
		'aria-label': 'Enter value'
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}