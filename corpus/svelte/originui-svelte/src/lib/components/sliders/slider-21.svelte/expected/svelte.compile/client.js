import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

var root = $.from_html(`<div class="*:not-first:mt-3"><!> <div class="flex items-center gap-4"><!> <!></div></div>`);

export default function Slider_21($$anchor) {
	const min = 5;
	const max = 1240;
	let value = $.state($.proxy([min, max]));
	const price = $.derived(() => $.get(value).map((v) => `$${v.toLocaleString()}${v == max ? '+' : ''}`));
	var div = root();
	var node = $.child(div);

	Label(node, {
		class: 'tabular-nums',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `From ${$.get(price)[0] ?? ''} to ${$.get(price)[1] ?? ''}`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Slider(node_1, {
		type: 'multiple',
		max,
		min,
		'aria-label': 'Price range slider',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Go');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}