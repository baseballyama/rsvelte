import * as $ from 'svelte/internal/server';
import Input from '../ui/input.svelte';
import Label from '../ui/label.svelte';

export default function Input_57($$renderer) {
	const uid = $.props_id($$renderer);

	$$renderer.push(`<div class="[&amp;>*:not(:first-child)]:mt-2">`);

	Label($$renderer, {
		class: 'flex-1',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Range`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="flex">`);

	Input($$renderer, {
		id: `${uid}-1`,
		class: 'flex-1 rounded-e-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
		placeholder: 'From',
		type: 'number',
		'aria-label': 'Min Value'
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		id: `${uid}-2`,
		class: '-ms-px flex-1 rounded-s-none [-moz-appearance:textfield] focus:z-10 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
		placeholder: 'To',
		type: 'number',
		'aria-label': 'Max Value'
	});

	$$renderer.push(`<!----></div></div>`);
}