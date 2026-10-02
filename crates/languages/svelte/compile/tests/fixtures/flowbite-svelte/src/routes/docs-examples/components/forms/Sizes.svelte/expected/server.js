import * as $ from 'svelte/internal/server';
import { Label, Input } from "flowbite-svelte";

export default function Sizes($$renderer) {
	$$renderer.push(`<div class="mb-6">`);

	Label($$renderer, {
		for: 'large-input',
		class: 'mb-2 block',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large input`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { id: 'large-input', size: 'lg', placeholder: 'Large input' });
	$$renderer.push(`<!----></div> <div class="mb-6">`);

	Label($$renderer, {
		for: 'default-input',
		class: 'mb-2 block',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default input`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { id: 'default-input', placeholder: 'Default input' });
	$$renderer.push(`<!----></div> <div class="mb-6">`);

	Label($$renderer, {
		for: 'small-input',
		class: 'mb-2 block',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small input`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Input($$renderer, { id: 'small-input', size: 'sm', placeholder: 'Small input' });
	$$renderer.push(`<!----></div>`);
}