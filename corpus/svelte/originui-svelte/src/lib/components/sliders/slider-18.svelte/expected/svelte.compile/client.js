import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

var root = $.from_html(`<div class="*:not-first:mt-3"><!> <div class="flex items-center gap-3"><!> <span class="text-2xl"> </span></div></div>`);

export default function Slider_18($$anchor) {
	const emojis = ['😡', '🙁', '😐', '🙂', '😍'];
	const labels = ['Awful', 'Poor', 'Okay', 'Good', 'Amazing'];
	let value = $.state(3);
	var div = root();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Rate your experience');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Slider(node_1, {
		type: 'single',
		min: 1,
		max: 5,
		showTooltip: true,
		tooltipContent: (value) => labels[value - 1],
		'aria-label': 'Rate your experience',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var span = $.sibling(node_1, 2);
	var text_1 = $.only_child(span, true);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text_1, emojis[$.get(value) - 1]));
	$.append($$anchor, div);
}