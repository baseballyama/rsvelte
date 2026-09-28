import * as $ from 'svelte/internal/server';
import { FloatingLabelInput } from "flowbite-svelte";

export default function Disabled($$renderer) {
	$$renderer.push(`<div id="exampleWrapper" class="grid w-full items-end gap-6 md:grid-cols-3">`);

	FloatingLabelInput($$renderer, {
		variant: 'filled',
		id: 'disabled_filled',
		name: 'disabled_filled',
		type: 'text',
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled filled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	FloatingLabelInput($$renderer, {
		variant: 'outlined',
		id: 'disabled_outlined',
		name: 'disabled_outlined',
		type: 'text',
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled outlined`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	FloatingLabelInput($$renderer, {
		id: 'disabled_standard',
		name: 'disabled_standard',
		type: 'text',
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled standard`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}