import * as $ from 'svelte/internal/server';
import { Kbd } from "flowbite-svelte";

export default function Text($$renderer) {
	$$renderer.push(`<p class="text-gray-500 dark:text-gray-400">Please press `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Ctrl`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> + `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Shift`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> + `);

	Kbd($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->R`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> to re-render an MDN page.</p>`);
}