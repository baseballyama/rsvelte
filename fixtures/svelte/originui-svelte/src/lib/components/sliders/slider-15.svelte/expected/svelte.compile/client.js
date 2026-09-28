import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import { useSliderWithInput } from '$lib/hooks/use-slider-with-input.svelte';
import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
import { cn } from '$lib/utils';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="space-y-3"><div class="flex items-center justify-between gap-2"><!> <div class="flex items-center gap-1"><!> <!></div></div> <div class="flex items-center gap-4"><!></div></div>`);

export default function Slider_15($$anchor, $$props) {
	$.push($$props, true);

	const minValue = 0;
	const maxValue = 2;
	const initialValue = [1.25];
	const defaultValue = [1];
	const slider = useSliderWithInput({ defaultValue, initialValue, maxValue, minValue });
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Temperature');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	TooltipProvider(node_1, {
		delayDuration: 0,
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							{
								let $0 = $.derived(() => cn('size-7 transition-opacity', slider.showReset ? 'opacity-100' : 'opacity-0'));

								Button($$anchor, $.spread_props(
									{
										size: 'icon',
										variant: 'ghost',
										get class() {
											return $.get($0);
										},
										'aria-label': 'Reset'
									},
									props,
									{
										get onclick() {
											return slider.resetToDefault;
										},

										children: ($$anchor, $$slotProps) => {
											RotateCcw($$anchor, { size: 16, 'aria-hidden': 'true' });
										},
										$$slots: { default: true }
									}
								));
							}
						};

						TooltipTrigger(node_2, { child, $$slots: { child: true } });
					}

					var node_3 = $.sibling(node_2, 2);

					TooltipContent(node_3, {
						class: 'px-2 py-1 text-xs',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Reset to default');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	Input(node_4, {
		class: 'h-7 w-12 px-2 py-0',
		type: 'text',
		inputmode: 'decimal',
		get value() {
			return slider.inputValues[0];
		},
		oninput: (e) => slider.handleInputChange(e, 0),
		onblur: () => slider.validateAndUpdateValue(slider.inputValues[0], 0),
		onkeydown: (e) => {
			if (e.key === 'Enter') {
				slider.validateAndUpdateValue(slider.inputValues[0], 0);
			}
		},
		'aria-label': 'Enter value'
	});

	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_5 = $.child(div_3);

	Slider(node_5, {
		type: 'multiple',
		class: 'grow',
		get onValueChange() {
			return slider.handleSliderChange;
		},
		min: minValue,
		max: maxValue,
		step: 0.01,
		'aria-label': 'Temperature',
		get value() {
			return slider.sliderValue;
		},

		set value($$value) {
			slider.sliderValue = $$value;
		}
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}