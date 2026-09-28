import * as $ from 'svelte/internal/server';
import { Checkbox } from "flowbite-svelte";

export default function Default($$renderer) {
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

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		indeterminate: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Indeterminate state`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}