import * as $ from 'svelte/internal/server';
import { Input, ButtonGroup, Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline, SearchOutline } from "flowbite-svelte-icons";

export default function Dropdown_1($$renderer) {
	ButtonGroup($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			Button($$renderer, {
				color: undefined,
				class: 'shrink-0 border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800',
				children: ($$renderer) => {
					$$renderer.push(`<!---->All categories`);
					ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Dropdown($$renderer, {
				simple: true,
				children: ($$renderer) => {
					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Shopping`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Images`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->News`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Finance`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Input($$renderer, { placeholder: 'Search' });
			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'primary',
				class: 'p-2.5!',
				type: 'submit',
				children: ($$renderer) => {
					SearchOutline($$renderer, { class: 'h-5 w-5' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}