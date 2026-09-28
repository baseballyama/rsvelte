import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

var root = $.from_html(`<div class="space-y-4"><div class="flex items-center justify-between gap-2"><!> <output class="text-sm font-medium tabular-nums"> </output></div> <!></div>`);

export default function Slider_08($$anchor) {
	let value = $.state(25);
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Label(node, {
		class: 'leading-6',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Slider with output');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var output = $.sibling(node, 2);
	var text_1 = $.only_child(output, true);

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	Slider(node_1, {
		type: 'single',
		'aria-label': 'Slider with output',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.reset(div);
	$.template_effect(() => $.set_text(text_1, $.get(value)));
	$.append($$anchor, div);
}