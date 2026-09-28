import * as $ from 'svelte/internal/server';
import { Input, Label, P } from "flowbite-svelte";
import { MapPinAltSolid } from "flowbite-svelte-icons";

export default function Zip($$renderer) {
	const zipPattern = "^\\d{5}(-\\d{4})?$";

	$$renderer.push(`<form class="mx-auto max-w-sm">`);

	Label($$renderer, {
		class: 'mb-2 text-sm',
		for: 'zip-input',
		children: ($$renderer) => {
			$$renderer.push(`<!---->ZIP code:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="relative"><div class="pointer-events-none absolute inset-y-0 start-0 top-0 flex items-center ps-3.5">`);
	MapPinAltSolid($$renderer, {});
	$$renderer.push(`<!----></div> `);

	Input($$renderer, {
		type: 'text',
		pattern: zipPattern,
		title: 'Enter ZIP code: 12345 or 12345-6789',
		inputmode: 'numeric',
		placeholder: '12345 or 12345-6789',
		class: 'ps-10',
		'aria-describedby': 'helper-text-explanation',
		required: true
	});

	$$renderer.push(`<!----></div> `);

	P($$renderer, {
		id: 'helper-text-explanation',
		class: 'mt-2 text-sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Enter either a standard 5-digit ZIP code or the extended ZIP+4.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form>`);
}