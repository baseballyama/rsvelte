import * as $ from 'svelte/internal/server';
import { PhoneInput, Input } from "flowbite-svelte";

export default function Disabled($$renderer) {
	$$renderer.push(`<form class="mx-auto max-w-sm space-y-2">`);

	Input($$renderer, {
		disabled: true,
		type: 'number',
		id: 'number-input',
		'aria-describedby': 'helper-text-explanation',
		placeholder: '90210',
		required: true
	});

	$$renderer.push(`<!----> `);

	PhoneInput($$renderer, {
		classes: { input: "rounded-lg" },
		placeholder: '123-456-7890',
		disabled: true,
		phoneType: 'countryCode'
	});

	$$renderer.push(`<!----></form>`);
}