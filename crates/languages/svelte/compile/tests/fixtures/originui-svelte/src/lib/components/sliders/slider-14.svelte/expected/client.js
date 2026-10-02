import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

var root = $.from_html(`<div class="*:not-first:mt-4"><!> <!></div>`);

export default function Slider_14($$anchor) {
	var div = root();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Slider with multiple thumbs');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Slider(node_1, {
		type: 'multiple',
		value: [25, 50, 100],
		'aria-label': 'Slider with multiple thumbs',
		showTooltip: true,
		tooltipContent: (value) => `${value}%`
	});

	$.reset(div);
	$.append($$anchor, div);
}