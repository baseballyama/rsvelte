import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

var root = $.from_html(`<div class="*:not-first:mt-4"><!> <div class="flex h-40 justify-center"><!></div></div>`);

export default function Slider_22($$anchor) {
	var div = root();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Vertical slider');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Slider(node_1, {
		type: 'single',
		value: 5,
		max: 10,
		orientation: 'vertical',
		'aria-label': 'Vertical slider'
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}