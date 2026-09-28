import * as $ from 'svelte/internal/server';
import { Card, Dropdown, DropdownItem, Avatar, Button } from "flowbite-svelte";
import { DotsHorizontalOutline } from "flowbite-svelte-icons";

export default function Profile($$renderer) {
	Card($$renderer, {
		class: 'p-4 sm:p-5 md:p-7',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex justify-end">`);
			DotsHorizontalOutline($$renderer, {});
			$$renderer.push(`<!----> `);

			Dropdown($$renderer, {
				class: 'w-36',
				children: ($$renderer) => {
					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Edit`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Export data`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Delete`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-col items-center pb-4">`);
			Avatar($$renderer, { size: 'lg', src: '/images/profile-picture-3.webp' });
			$$renderer.push(`<!----> <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">Bonnie Green</h5> <span class="text-sm text-gray-500 dark:text-gray-400">Visual Designer</span> <div class="mt-4 flex space-x-3 lg:mt-6 rtl:space-x-reverse">`);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add friend`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'light',
				class: 'dark:text-white',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Message`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}