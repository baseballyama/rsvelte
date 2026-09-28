import * as $ from 'svelte/internal/server';
import { FloatingLabelInput } from "flowbite-svelte";

export default function Sizes($$renderer) {
	$$renderer.push(`<div class="mb-6 grid items-end gap-6 md:grid-cols-3">`);

	FloatingLabelInput($$renderer, {
		size: 'small',
		variant: 'filled',
		id: 'small_filled',
		name: 'small_filled',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small filled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	FloatingLabelInput($$renderer, {
		size: 'small',
		variant: 'outlined',
		id: 'small_outlined',
		name: 'small_outlined',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small outlined`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	FloatingLabelInput($$renderer, {
		size: 'small',
		id: 'small_standard',
		name: 'small_standard',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small standard`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="grid items-end gap-6 md:grid-cols-3">`);

	FloatingLabelInput($$renderer, {
		variant: 'filled',
		id: 'default_filled',
		name: 'default_filled',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default filled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	FloatingLabelInput($$renderer, {
		variant: 'outlined',
		id: 'default_outlined',
		name: 'default_outlined',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default outlined`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	FloatingLabelInput($$renderer, {
		id: 'default_standard',
		name: 'default_standard',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default standard`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}