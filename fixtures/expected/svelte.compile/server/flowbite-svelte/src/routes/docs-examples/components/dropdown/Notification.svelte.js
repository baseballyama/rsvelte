import * as $ from 'svelte/internal/server';
import { Dropdown, DropdownItem, DropdownGroup, Avatar } from "flowbite-svelte";
import { BellSolid, EyeSolid } from "flowbite-svelte-icons";

export default function Notification($$renderer) {
	$$renderer.push(`<div id="bell" class="inline-flex items-center text-center text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-hidden dark:text-gray-400 dark:hover:text-white">`);
	BellSolid($$renderer, { class: 'h-8 w-8' });
	$$renderer.push(`<!----> <div class="relative flex"><div class="relative end-4 -top-2 inline-flex h-3 w-3 rounded-full border-2 border-white bg-red-500 dark:border-gray-900"></div></div></div> `);

	Dropdown($$renderer, {
		triggeredBy: '#bell',
		class: 'w-full max-w-sm divide-y divide-gray-100 rounded-sm shadow-sm dark:divide-gray-700 dark:bg-gray-800',
		children: ($$renderer) => {
			$$renderer.push(`<div class="py-2 text-center font-bold">Notifications</div> `);

			DropdownGroup($$renderer, {
				children: ($$renderer) => {
					DropdownItem($$renderer, {
						class: 'flex space-x-4 rtl:space-x-reverse',
						children: ($$renderer) => {
							Avatar($$renderer, {
								src: '/images/profile-picture-1.webp',
								dot: { color: "gray" }
							});

							$$renderer.push(`<!----> <div class="w-full ps-3"><div class="mb-1.5 text-sm text-gray-500 dark:text-gray-400">New message from <span class="font-semibold text-gray-900 dark:text-white">Jese Leos</span> : "Hey, what's up? All set for the presentation?"</div> <div class="text-primary-600 dark:text-primary-500 text-xs">a few moments ago</div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						class: 'flex space-x-4 rtl:space-x-reverse',
						children: ($$renderer) => {
							Avatar($$renderer, { src: '/images/profile-picture-2.webp', dot: { color: "red" } });
							$$renderer.push(`<!----> <div class="w-full ps-3"><div class="mb-1.5 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold text-gray-900 dark:text-white">Joseph Mcfall</span> and <span class="font-medium text-gray-900 dark:text-white">5 others</span> started following you.</div> <div class="text-primary-600 dark:text-primary-500 text-xs">10 minutes ago</div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						class: 'flex space-x-4 rtl:space-x-reverse',
						children: ($$renderer) => {
							Avatar($$renderer, {
								src: '/images/profile-picture-3.webp',
								dot: { color: "green" }
							});

							$$renderer.push(`<!----> <div class="w-full ps-3"><div class="mb-1.5 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold text-gray-900 dark:text-white">Bonnie Green</span> and <span class="font-medium text-gray-900 dark:text-white">141 others</span> love your story. See it and view more stories.</div> <div class="text-primary-600 dark:text-primary-500 text-xs">44 minutes ago</div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <a href="/" class="-my-1 block bg-gray-50 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"><div class="inline-flex items-center">`);
			EyeSolid($$renderer, { class: 'me-2 h-4 w-4 text-gray-500 dark:text-gray-400' });
			$$renderer.push(`<!----> View all</div></a>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}