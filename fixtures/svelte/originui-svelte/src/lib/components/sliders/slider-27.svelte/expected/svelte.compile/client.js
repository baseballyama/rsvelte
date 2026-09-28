import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';

var root = $.from_html(`<div class="space-y-4"><legend class="text-foreground text-sm font-medium">Equalizer</legend> <div class="flex h-48 justify-center gap-8"><div class="flex flex-col items-center gap-2"><!> <!></div> <div class="flex flex-col items-center gap-2"><!> <!></div> <div class="flex flex-col items-center gap-2"><!> <!></div> <div class="flex flex-col items-center gap-2"><!> <!></div> <div class="flex flex-col items-center gap-2"><!> <!></div></div></div>`);

export default function Slider_27($$anchor) {
	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Slider(node, {
		type: 'single',
		value: 2,
		min: -5,
		max: 5,
		orientation: 'vertical',
		class: '*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded',
		'aria-label': '60 Hz',
		showTooltip: true
	});

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		class: 'text-muted-foreground flex w-0 justify-center text-xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('60');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Slider(node_2, {
		type: 'single',
		value: 1,
		min: -5,
		max: 5,
		orientation: 'vertical',
		class: '*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded',
		'aria-label': '250 Hz',
		showTooltip: true
	});

	var node_3 = $.sibling(node_2, 2);

	Label(node_3, {
		class: 'text-muted-foreground flex w-0 justify-center text-xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('250');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_4 = $.child(div_4);

	Slider(node_4, {
		type: 'single',
		value: -1,
		min: -5,
		max: 5,
		orientation: 'vertical',
		class: '*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded',
		'aria-label': '1k',
		showTooltip: true
	});

	var node_5 = $.sibling(node_4, 2);

	Label(node_5, {
		class: 'text-muted-foreground flex w-0 justify-center text-xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('1k');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_6 = $.child(div_5);

	Slider(node_6, {
		type: 'single',
		value: -3,
		min: -5,
		max: 5,
		orientation: 'vertical',
		class: '*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded',
		'aria-label': '4k',
		showTooltip: true
	});

	var node_7 = $.sibling(node_6, 2);

	Label(node_7, {
		class: 'text-muted-foreground flex w-0 justify-center text-xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('4k');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_8 = $.child(div_6);

	Slider(node_8, {
		type: 'single',
		value: 2,
		min: -5,
		max: 5,
		orientation: 'vertical',
		class: '*:data-slider-thumb:h-6 *:data-slider-thumb:w-4 *:data-slider-thumb:rounded',
		'aria-label': '16k',
		showTooltip: true
	});

	var node_9 = $.sibling(node_8, 2);

	Label(node_9, {
		class: 'text-muted-foreground flex w-0 justify-center text-xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('16K');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}