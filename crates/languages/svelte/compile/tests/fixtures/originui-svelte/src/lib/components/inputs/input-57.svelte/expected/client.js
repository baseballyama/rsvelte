import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '../ui/input.svelte';
import Label from '../ui/label.svelte';

var root = $.from_html(`<div class="[&amp;>*:not(:first-child)]:mt-2"><!> <div class="flex"><!> <!></div></div>`);

export default function Input_57($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		class: 'flex-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Range');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Input(node_1, {
		get id() {
			return `${uid}-1`;
		},
		class: 'flex-1 rounded-e-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
		placeholder: 'From',
		type: 'number',
		'aria-label': 'Min Value'
	});

	var node_2 = $.sibling(node_1, 2);

	Input(node_2, {
		get id() {
			return `${uid}-2`;
		},
		class: '-ms-px flex-1 rounded-s-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
		placeholder: 'To',
		type: 'number',
		'aria-label': 'Max Value'
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}