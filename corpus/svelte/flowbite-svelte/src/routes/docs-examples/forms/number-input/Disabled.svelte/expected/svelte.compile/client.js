import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PhoneInput, Input } from "flowbite-svelte";

var root = $.from_html(`<form class="mx-auto max-w-sm space-y-2"><!> <!></form>`);

export default function Disabled($$anchor) {
	var form = root();
	var node = $.child(form);

	Input(node, {
		disabled: true,
		type: 'number',
		id: 'number-input',
		'aria-describedby': 'helper-text-explanation',
		placeholder: '90210',
		required: true
	});

	var node_1 = $.sibling(node, 2);

	PhoneInput(node_1, {
		classes: { input: "rounded-lg" },
		placeholder: '123-456-7890',
		disabled: true,
		phoneType: 'countryCode'
	});

	$.reset(form);
	$.append($$anchor, form);
}