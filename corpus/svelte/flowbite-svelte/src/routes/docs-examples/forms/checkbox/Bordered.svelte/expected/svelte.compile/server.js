import * as $ from 'svelte/internal/server';
import { Checkbox } from "flowbite-svelte";

export default function Bordered($$renderer) {
	$$renderer.push(`<div class="rounded-sm border border-gray-200 dark:border-gray-700">`);

	Checkbox($$renderer, {
		classes: { div: "w-full p-4" },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default radio`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="rounded-sm border border-gray-200 dark:border-gray-700">`);

	Checkbox($$renderer, {
		checked: true,
		classes: { div: "w-full p-4" },
		children: ($$renderer) => {
			$$renderer.push(`<!---->Checked state`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}