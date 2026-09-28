import * as $ from 'svelte/internal/server';
import { Checkbox } from "flowbite-svelte";

export default function Inline($$renderer) {
	$$renderer.push(`<div class="flex gap-3">`);

	Checkbox($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Inline 1`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Inline 2`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Inline checked`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Inline disabled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}