import * as $ from 'svelte/internal/server';
import { Button, Dropdown, Toggle } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function Toggle_1($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dropdown toggle`);
			ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		simple: true,
		class: 'w-56 space-y-1 p-3',
		children: ($$renderer) => {
			$$renderer.push(`<li>`);

			Toggle($$renderer, {
				class: 'rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default toggle`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li> <li>`);

			Toggle($$renderer, {
				class: 'rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600',
				checked: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Checked state`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li> <li>`);

			Toggle($$renderer, {
				class: 'rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default toggle`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}