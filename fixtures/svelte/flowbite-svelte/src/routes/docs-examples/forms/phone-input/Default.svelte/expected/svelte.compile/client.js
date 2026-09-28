import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PhoneInput, Label, Helper } from "flowbite-svelte";

var root = $.from_html(`<form class="mx-auto max-w-sm"><!> <!> <!></form>`);

export default function Default($$anchor) {
	var form = root();
	var node = $.child(form);

	Label(node, {
		for: 'phone-input',
		class: 'mb-2 text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Phone number:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	PhoneInput(node_1, {
		'aria-describedby': 'helper-text-explanation',
		id: 'phone-input',
		placeholder: '123-456-7890',
		required: true
	});

	var node_2 = $.sibling(node_1, 2);

	Helper(node_2, {
		class: 'mt-2 text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Select a phone number that matches the format.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}