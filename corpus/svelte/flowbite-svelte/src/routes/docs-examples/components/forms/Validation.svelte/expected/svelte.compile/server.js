import * as $ from 'svelte/internal/server';
import { Label, Input, Helper } from "flowbite-svelte";

export default function Validation($$renderer) {
	$$renderer.push(`<div class="mb-6">`);

	Label($$renderer, {
		for: 'success',
		color: 'green',
		class: 'mb-2 block',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your name`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { id: 'success', color: 'green', placeholder: 'Success input' });
	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		class: 'mt-2',
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Well done!</span> Some success message.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="mb-6">`);

	Label($$renderer, {
		for: 'error',
		color: 'red',
		class: 'mb-2 block',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your name`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { id: 'error', color: 'red', placeholder: 'Error input' });
	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		class: 'mt-2',
		color: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Not so well done!</span> Some error message.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}