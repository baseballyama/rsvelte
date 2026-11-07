import * as $ from 'svelte/internal/server';
import { Input, Label } from "flowbite-svelte";

export default function Default($$renderer) {
	$$renderer.push(`<form class="mx-auto max-w-sm">`);

	Label($$renderer, {
		for: 'number-input',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select a number:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		type: 'number',
		id: 'number-input',
		'aria-describedby': 'helper-text-explanation',
		placeholder: '90210',
		required: true
	});

	$$renderer.push(`<!----></form>`);
}