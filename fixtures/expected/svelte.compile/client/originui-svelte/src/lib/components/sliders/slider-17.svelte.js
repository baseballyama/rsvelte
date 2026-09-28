import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

var root = $.from_html(`<div class="space-y-3"><div class="flex items-center justify-between gap-2"><!> <span class="text-sm font-medium"> </span></div> <div class="flex items-center gap-2"><span class="text-2xl">😡</span> <!> <span class="text-2xl">😍</span></div></div>`);

export default function Slider_17($$anchor) {
	const labels = ['Awful', 'Poor', 'Okay', 'Good', 'Amazing'];
	let value = $.state(3);
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Label(node, {
		class: 'leading-6',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Rate your experience');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var span = $.sibling(node, 2);
	var text_1 = $.only_child(span, true);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.sibling($.child(div_2), 2);

	Slider(node_1, {
		type: 'single',
		min: 1,
		max: 5,
		'aria-label': 'Rate your experience',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.next(2);
	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => $.set_text(text_1, labels[$.get(value) - 1]));
	$.append($$anchor, div);
}