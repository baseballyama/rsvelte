import * as $ from 'svelte/internal/server';
import { Badge } from "flowbite-svelte";
import { CheckOutline } from "flowbite-svelte-icons";

export default function IconOnly($$renderer) {
	Badge($$renderer, {
		color: 'gray',
		large: true,
		class: 'p-1! font-semibold!',
		children: ($$renderer) => {
			CheckOutline($$renderer, { class: 'h-3 w-3' });
			$$renderer.push(`<!----> <span class="sr-only">Icon description</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Badge($$renderer, {
		rounded: true,
		large: true,
		class: 'p-1! font-semibold!',
		children: ($$renderer) => {
			CheckOutline($$renderer, { class: 'text-primary-800 dark:text-primary-400 h-3 w-3' });
			$$renderer.push(`<!----> <span class="sr-only">Icon description</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}