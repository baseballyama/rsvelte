import * as $ from 'svelte/internal/server';
import { Checkbox } from "flowbite-svelte";

export default function Inline2($$renderer) {
	Checkbox($$renderer, {
		inline: true,
		classes: { div: "me-2" },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Inline 1`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		inline: true,
		classes: { div: "me-2" },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Inline 2`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		inline: true,
		classes: { div: "me-2" },
		checked: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Inline checked`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Checkbox($$renderer, {
		inline: true,
		classes: { div: "me-2" },
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Inline disabled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}