import * as $ from 'svelte/internal/server';
import { Toggle } from "flowbite-svelte";

export default function Toggle_1($$renderer) {
	Toggle($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Toggle me`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Checked toggle`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled toggle`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Toggle($$renderer, {
		checked: true,
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled checked`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}