import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<span class="flex w-0 flex-col items-center justify-center gap-2"><span></span> <span></span></span>`);
var root_1 = $.from_html(`<div class="*:not-first:mt-4"><!> <div><!> <span class="text-muted-foreground mt-3 flex w-full items-center justify-between gap-1 px-2.5 text-xs font-medium" aria-hidden="true"></span></div></div>`);

export default function Slider_07($$anchor, $$props) {
	$.push($$props, true);

	const max = 12;
	const skipInterval = 2; // Set to 1 to allow no text skipping
	const ticks = [...Array(max + 1)].map((_, i) => i);
	var div = root_1();
	var node = $.child(div);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Slider with ticks');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Slider(node_1, {
		type: 'single',
		value: 5,
		max,
		get step() {
			return ticks;
		},
		'aria-label': 'Slider with ticks'
	});

	var span = $.sibling(node_1, 2);

	$.each(span, 21, () => ticks, $.index, ($$anchor, _, index) => {
		var span_1 = root();
		var span_2 = $.child(span_1);
		var span_3 = $.sibling(span_2, 2);

		span_3.textContent = index;
		$.reset(span_1);

		$.template_effect(
			($0, $1) => {
				$.set_class(span_2, 1, $0);
				$.set_class(span_3, 1, $1);
			},
			[
				() => $.clsx(cn('bg-muted-foreground/70 h-1 w-px', index % skipInterval !== 0 && 'h-0.5')),
				() => $.clsx(cn(index % skipInterval !== 0 && 'opacity-0'))
			]
		);

		$.append($$anchor, span_1);
	});

	$.reset(span);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}