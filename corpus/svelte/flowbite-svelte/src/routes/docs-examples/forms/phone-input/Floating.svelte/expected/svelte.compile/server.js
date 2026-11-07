import * as $ from 'svelte/internal/server';
import { PhoneInput } from "flowbite-svelte";

export default function Floating($$renderer) {
	$$renderer.push(`<form class="mx-auto max-w-xs">`);

	PhoneInput($$renderer, {
		phoneType: 'floating',
		'aria-describedby': 'helper-text-explanation',
		id: 'floating-phone-number',
		placeholder: ' ',
		required: true
	});

	$$renderer.push(`<!----></form>`);
}