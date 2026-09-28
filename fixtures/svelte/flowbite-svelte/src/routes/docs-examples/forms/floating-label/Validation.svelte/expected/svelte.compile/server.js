import * as $ from 'svelte/internal/server';
import { FloatingLabelInput, Helper } from "flowbite-svelte";

export default function Validation($$renderer) {
	$$renderer.push(`<div class="mb-6 grid items-end gap-6 md:grid-cols-3"><div>`);

	FloatingLabelInput($$renderer, {
		color: 'green',
		variant: 'filled',
		id: 'filled_success',
		'aria-describedby': 'filled_success_help',
		name: 'filled_success',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Filled success`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Well done!</span> Some success message.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div>`);

	FloatingLabelInput($$renderer, {
		color: 'green',
		variant: 'outlined',
		id: 'outlined_success',
		'aria-describedby': 'outlined_success_help',
		name: 'outlined_success',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Outlined success`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Well done!</span> Some success message.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div>`);

	FloatingLabelInput($$renderer, {
		color: 'green',
		variant: 'standard',
		id: 'standard_success',
		'aria-describedby': 'standard_success_help',
		name: 'standard_success',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Standard success`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		color: 'green',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Well done!</span> Some success message.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div> <div class="mb-6 grid items-end gap-6 md:grid-cols-3"><div>`);

	FloatingLabelInput($$renderer, {
		color: 'red',
		variant: 'filled',
		id: 'filled_error',
		'aria-describedby': 'filled_error_help',
		name: 'filled_error',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Filled error`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		color: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Oh, snapp!</span> Some error message.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div>`);

	FloatingLabelInput($$renderer, {
		color: 'red',
		variant: 'outlined',
		id: 'outlined_error',
		'aria-describedby': 'outlined_error_help',
		name: 'outlined_success',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Outlined error`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		color: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Oh, snapp!</span> Some error message.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div>`);

	FloatingLabelInput($$renderer, {
		color: 'red',
		variant: 'standard',
		id: 'standard_error',
		'aria-describedby': 'standard_error_help',
		name: 'standard_success',
		type: 'text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Standard error`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		color: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<span class="font-medium">Oh, snapp!</span> Some error message.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div>`);
}