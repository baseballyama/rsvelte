import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

var root = $.from_html(`<!> Reset`, 1);
var root_1 = $.from_html(`<div class="space-y-4"><legend class="text-foreground text-sm font-medium">Object position</legend> <div class="space-y-2"><div class="flex items-center gap-4"><!> <!> <!></div> <div class="flex items-center gap-4"><!> <!> <!></div> <div class="flex items-center gap-4"><!> <!> <!></div></div> <!></div>`);

export default function Slider_25($$anchor) {
	const defaultValue = 0;
	const min = -10;
	const max = 10;
	let value = $.proxy({ x: -2, y: 4, z: 2 });

	function reset() {
		value.x = defaultValue;
		value.y = defaultValue;
		value.z = defaultValue;
	}

	function handleInputChange(e, key) {
		value[key] = parseFloat(e.currentTarget.value) || 0;
	}

	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Label(node, {
		class: 'text-muted-foreground text-xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('X');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Slider(node_1, {
		type: 'single',
		class: 'grow *:data-slider-thumb:rounded',
		min: -10,
		max: 10,
		'aria-label': 'X',
		get value() {
			return value.x;
		},

		set value($$value) {
			value.x = $$value;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Input(node_2, {
		class: 'h-8 w-12 [appearance:textfield] px-2 py-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
		type: 'number',
		inputmode: 'decimal',
		onchange: (e) => handleInputChange(e, 'x'),
		min,
		max,
		get value() {
			return value.x;
		},
		'aria-label': 'Enter value'
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_3 = $.child(div_3);

	Label(node_3, {
		class: 'text-muted-foreground text-xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Y');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Slider(node_4, {
		type: 'single',
		class: 'grow *:data-slider-thumb:rounded',
		min: -10,
		max: 10,
		'aria-label': 'Y',
		get value() {
			return value.y;
		},

		set value($$value) {
			value.y = $$value;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Input(node_5, {
		class: 'h-8 w-12 [appearance:textfield] px-2 py-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
		type: 'number',
		inputmode: 'decimal',
		onchange: (e) => handleInputChange(e, 'y'),
		min,
		max,
		get value() {
			return value.y;
		},
		'aria-label': 'Enter value'
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_6 = $.child(div_4);

	Label(node_6, {
		class: 'text-muted-foreground text-xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Z');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Slider(node_7, {
		type: 'single',
		class: 'grow *:data-slider-thumb:rounded',
		min: -10,
		max: 10,
		'aria-label': 'Z',
		get value() {
			return value.z;
		},

		set value($$value) {
			value.z = $$value;
		}
	});

	var node_8 = $.sibling(node_7, 2);

	Input(node_8, {
		class: 'h-8 w-12 [appearance:textfield] px-2 py-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
		type: 'number',
		inputmode: 'decimal',
		onchange: (e) => handleInputChange(e, 'z'),
		min,
		max,
		get value() {
			return value.z;
		},
		'aria-label': 'Enter value'
	});

	$.reset(div_4);
	$.reset(div_1);

	var node_9 = $.sibling(div_1, 2);

	Button(node_9, {
		class: 'w-full',
		variant: 'outline',
		onclick: reset,
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_10 = $.first_child(fragment);

			RotateCcw(node_10, {
				class: '-ms-1 me-2 opacity-60',
				size: 16,
				'aria-hidden': 'true'
			});

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}