import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label, P } from "flowbite-svelte";
import { MapPinAltSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<form class="mx-auto max-w-sm"><!> <div class="relative"><div class="pointer-events-none absolute inset-y-0 start-0 top-0 flex items-center ps-3.5"><!></div> <!></div> <!></form>`);

export default function Zip($$anchor) {
	const zipPattern = "^\\d{5}(-\\d{4})?$";
	var form = root();
	var node = $.child(form);

	Label(node, {
		class: 'mb-2 text-sm',
		for: 'zip-input',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('ZIP code:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	MapPinAltSolid(node_1, {});
	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	Input(node_2, {
		type: 'text',
		pattern: zipPattern,
		title: 'Enter ZIP code: 12345 or 12345-6789',
		inputmode: 'numeric',
		placeholder: '12345 or 12345-6789',
		class: 'ps-10',
		'aria-describedby': 'helper-text-explanation',
		required: true
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	P(node_3, {
		id: 'helper-text-explanation',
		class: 'mt-2 text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Enter either a standard 5-digit ZIP code or the extended ZIP+4.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}