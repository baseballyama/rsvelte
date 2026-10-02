import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

var root = $.from_html(`<div class="*:not-first:mt-4"><!> <!></div>`);

export default function Slider_05($$anchor) {
	var div = root();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Slider with tiny thumb');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Slider(node_1, {
		type: 'single',
		value: 25,
		class: '*:data-slider-thumb:border-background *:data-slider-thumb:bg-primary *:data-slider-thumb:h-6 *:data-slider-thumb:w-2.5 *:data-slider-thumb:border-[3px] *:data-slider-thumb:ring-offset-0',
		'aria-label': 'Slider with tiny thumb'
	});

	$.reset(div);
	$.append($$anchor, div);
}