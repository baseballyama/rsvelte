import * as $ from 'svelte/internal/server';
import { Radio } from "flowbite-svelte";

export default function Radio_1($$renderer) {
	Radio($$renderer, {
		name: 'example',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default radio`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Radio($$renderer, {
		name: 'example',
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Checked state`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}