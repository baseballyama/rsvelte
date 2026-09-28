import * as $ from 'svelte/internal/server';
import { FloatingLabelInput } from "flowbite-svelte";

export default function Clearable($$renderer) {
	$$renderer.push(`<div id="exampleWrapper" class="grid w-full items-end gap-6 md:grid-cols-3">`);

	FloatingLabelInput($$renderer, {
		clearable: true,
		variant: 'filled',
		id: 'clearable_filled',
		name: 'clearable_illed',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Floating filled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	FloatingLabelInput($$renderer, {
		clearable: true,
		variant: 'outlined',
		id: 'clearable_outlined',
		name: 'clearable_outlined',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Floating outlined`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	FloatingLabelInput($$renderer, {
		clearable: true,
		id: 'clearable_standard',
		name: 'clearable_standard',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Floating standard`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}