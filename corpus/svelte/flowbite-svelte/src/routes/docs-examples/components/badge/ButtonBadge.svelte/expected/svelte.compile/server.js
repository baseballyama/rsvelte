import * as $ from 'svelte/internal/server';
import { Badge, Button } from "flowbite-svelte";

export default function ButtonBadge($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Messages `);

			Badge($$renderer, {
				rounded: true,
				class: 'text-primary-800 dark:text-primary-800 ms-2 h-4 w-4 bg-white p-0 font-semibold dark:bg-white',
				children: ($$renderer) => {
					$$renderer.push(`<!---->2`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}