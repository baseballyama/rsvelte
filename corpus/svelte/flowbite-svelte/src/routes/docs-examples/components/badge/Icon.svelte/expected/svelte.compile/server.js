import * as $ from 'svelte/internal/server';
import { Badge } from "flowbite-svelte";
import { ClockSolid } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	Badge($$renderer, {
		color: 'gray',
		border: true,
		children: ($$renderer) => {
			ClockSolid($$renderer, { class: 'me-1.5 h-2.5 w-2.5' });
			$$renderer.push(`<!----> 3 days ago`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		border: true,
		children: ($$renderer) => {
			ClockSolid($$renderer, {
				class: 'text-primary-800 dark:text-primary-400 me-1.5 h-2.5 w-2.5'
			});

			$$renderer.push(`<!----> 2 minutes ago`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}