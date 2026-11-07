import * as $ from 'svelte/internal/server';
import { FloatingLabelInput } from "flowbite-svelte";

export default function Default($$renderer) {
	$$renderer.push(`<div id="exampleWrapper" class="grid w-full items-end gap-6 md:grid-cols-3">`);

	FloatingLabelInput($$renderer, {
		variant: 'filled',
		id: 'floating_filled',
		name: 'floating_filled',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Floating filled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	FloatingLabelInput($$renderer, {
		variant: 'outlined',
		id: 'floating_outlined',
		name: 'floating_outlined',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Floating outlined`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	FloatingLabelInput($$renderer, {
		id: 'floating_standard',
		name: 'floating_standard',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Floating standard`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}