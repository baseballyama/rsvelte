import * as $ from 'svelte/internal/server';
import { Checkbox } from "flowbite-svelte";

export default function Checkbox_1($$renderer) {
	Checkbox($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default checkbox`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Checked state`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}