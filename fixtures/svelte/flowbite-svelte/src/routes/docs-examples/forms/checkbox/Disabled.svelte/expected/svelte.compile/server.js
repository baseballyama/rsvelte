import * as $ from 'svelte/internal/server';
import { Checkbox } from "flowbite-svelte";

export default function Disabled($$renderer) {
	Checkbox($$renderer, {
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled checkbox`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		disabled: true,
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled checked`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		disabled: true,
		indeterminate: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled indeterminate`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}