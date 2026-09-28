import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label } from "flowbite-svelte";

var root = $.from_html(`<form class="mx-auto max-w-sm"><!> <!></form>`);

export default function Default($$anchor) {
	var form = root();
	var node = $.child(form);

	Label(node, {
		for: 'number-input',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select a number:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		type: 'number',
		id: 'number-input',
		'aria-describedby': 'helper-text-explanation',
		placeholder: '90210',
		required: true
	});

	$.reset(form);
	$.append($$anchor, form);
}