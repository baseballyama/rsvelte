import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import Volume2 from '@lucide/svelte/icons/volume-2';
import VolumeX from '@lucide/svelte/icons/volume-x';

var root = $.from_html(`<div class="space-y-3"><div class="flex items-center justify-between gap-2"><!> <output class="text-sm font-medium tabular-nums"> </output></div> <div class="flex items-center gap-2"><!> <!> <!></div></div>`);

export default function Slider_13($$anchor) {
	let value = $.state(25);
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Label(node, {
		class: 'leading-6',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Volume');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var output = $.sibling(node, 2);
	var text_1 = $.only_child(output, true);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	VolumeX(node_1, {
		class: 'shrink-0 opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	var node_2 = $.sibling(node_1, 2);

	Slider(node_2, {
		type: 'single',
		'aria-label': 'Volume slider',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Volume2(node_3, {
		class: 'shrink-0 opacity-60',
		size: 16,
		'aria-hidden': 'true'
	});

	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => $.set_text(text_1, $.get(value)));
	$.append($$anchor, div);
}