import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PhoneInput } from "flowbite-svelte";

var root = $.from_html(`<form class="mx-auto max-w-xs"><!></form>`);

export default function Floating($$anchor) {
	var form = root();
	var node = $.child(form);

	PhoneInput(node, {
		phoneType: 'floating',
		'aria-describedby': 'helper-text-explanation',
		id: 'floating-phone-number',
		placeholder: ' ',
		required: true
	});

	$.reset(form);
	$.append($$anchor, form);
}