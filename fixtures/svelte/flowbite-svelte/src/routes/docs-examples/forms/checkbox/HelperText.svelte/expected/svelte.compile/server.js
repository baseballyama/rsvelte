import * as $ from 'svelte/internal/server';
import { Checkbox, Helper } from "flowbite-svelte";

export default function HelperText($$renderer) {
	Checkbox($$renderer, {
		'aria-describedby': 'helper-checkbox-text',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Free shipping via Flowbite`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		id: 'helper-checkbox-text',
		class: 'ps-6',
		children: ($$renderer) => {
			$$renderer.push(`<!---->For orders shipped from $25 in books or $29 in other categories`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}