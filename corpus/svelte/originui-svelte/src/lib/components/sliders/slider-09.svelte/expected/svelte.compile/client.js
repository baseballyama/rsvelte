import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

var root = $.from_html(`<div class="*:not-first:mt-4"><!> <div><span class="text-muted-foreground mb-3 flex w-full items-center justify-between gap-2 text-xs font-medium" aria-hidden="true"><span>Low</span> <span>High</span></span> <!></div></div>`);

export default function Slider_09($$anchor) {
	var div = root();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Slider with labels');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	Slider(node_1, {
		type: 'single',
		value: 50,
		step: 10,
		'aria-label': 'Slider with labels'
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}