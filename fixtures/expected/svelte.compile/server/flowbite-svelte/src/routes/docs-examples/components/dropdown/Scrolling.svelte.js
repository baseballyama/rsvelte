import * as $ from 'svelte/internal/server';
import { Button, Dropdown, DropdownItem, DropdownGroup, Avatar } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function Scrolling($$renderer) {
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
		class: 'h-48 w-48 overflow-y-auto py-1',
		children: ($$renderer) => {
			DropdownGroup($$renderer, {
				children: ($$renderer) => {
					DropdownItem($$renderer, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$renderer) => {
							Avatar($$renderer, { src: '/images/profile-picture-1.webp', size: 'xs' });
							$$renderer.push(`<!---->Jese Leos`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$renderer) => {
							Avatar($$renderer, { src: '/images/profile-picture-2.webp', size: 'xs' });
							$$renderer.push(`<!---->Robert Gouth`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$renderer) => {
							Avatar($$renderer, { src: '/images/profile-picture-3.webp', size: 'xs' });
							$$renderer.push(`<!---->Bonnie Green`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$renderer) => {
							Avatar($$renderer, { src: '/images/profile-picture-1.webp', size: 'xs' });
							$$renderer.push(`<!---->Robert Wall`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$renderer) => {
							Avatar($$renderer, { src: '/images/profile-picture-2.webp', size: 'xs' });
							$$renderer.push(`<!---->Joseph Mcfall`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						class: 'flex items-center gap-2 text-base font-semibold',
						children: ($$renderer) => {
							Avatar($$renderer, { src: '/images/profile-picture-3.webp', size: 'xs' });
							$$renderer.push(`<!---->Leslie Livingston`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <a href="/" class="text-primary-600 dark:text-primary-500 -mb-1 flex items-center bg-gray-50 px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:underline dark:bg-gray-700 dark:hover:bg-gray-600">`);
			ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->Add new user</a>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}