import * as $ from 'svelte/internal/server';

import {
	Dropdown,
	DropdownItem,
	DropdownGroup,
	Checkbox,
	Button,
	Search
} from "flowbite-svelte";

import { ChevronDownOutline, UserRemoveSolid } from "flowbite-svelte-icons";

export default function Dropdown_1($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Project users`);
			ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="p-3">`);
			Search($$renderer, { size: 'md' });
			$$renderer.push(`<!----></div> `);

			DropdownGroup($$renderer, {
				class: 'h-48 overflow-y-auto',
				children: ($$renderer) => {
					DropdownItem($$renderer, {
						children: ($$renderer) => {
							Checkbox($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Robert Gouth`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							Checkbox($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Jese Leos`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							Checkbox($$renderer, {
								checked: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Bonnie Green`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							Checkbox($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Jese Leos`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							Checkbox($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Robert Gouth`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							Checkbox($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Bonnie Green`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <a href="/" class="-mb-1 flex items-center bg-gray-50 p-3 text-sm font-medium text-red-600 hover:bg-gray-100 hover:underline dark:bg-gray-700 dark:text-red-500 dark:hover:bg-gray-600">`);
			UserRemoveSolid($$renderer, { class: 'me-1 h-5 w-5' });
			$$renderer.push(`<!---->Delete user</a>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}