import * as $ from 'svelte/internal/server';

import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownGroup,
	DropdownHeader
} from "flowbite-svelte";

import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function Header($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dropdown button`);
			ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		children: ($$renderer) => {
			DropdownHeader($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span class="block text-sm text-gray-900 dark:text-white">Bonnie Green</span> <span class="block truncate text-sm font-medium">name@flowbite.com</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownGroup($$renderer, {
				children: ($$renderer) => {
					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dashboard`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Settings`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Earnings`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Sign out`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}