import * as $ from 'svelte/internal/server';
import { PhoneInput, Label, Helper } from "flowbite-svelte";

export default function Default($$renderer) {
	$$renderer.push(`<form class="mx-auto max-w-sm">`);

	Label($$renderer, {
		for: 'phone-input',
		class: 'mb-2 text-sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Phone number:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	PhoneInput($$renderer, {
		'aria-describedby': 'helper-text-explanation',
		id: 'phone-input',
		placeholder: '123-456-7890',
		required: true
	});

	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		class: 'mt-2 text-sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select a phone number that matches the format.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form>`);
}