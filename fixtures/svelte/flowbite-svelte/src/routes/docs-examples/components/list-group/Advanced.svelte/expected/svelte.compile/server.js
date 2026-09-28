import * as $ from 'svelte/internal/server';
import { Listgroup, ListgroupItem, Avatar } from "flowbite-svelte";
import { TrashBinSolid } from "flowbite-svelte-icons";

export default function Advanced($$renderer) {
	Listgroup($$renderer, {
		active: true,
		class: 'w-48',
		children: ($$renderer) => {
			$$renderer.push(`<h3 class="p-1 text-center text-xl font-medium text-gray-900 dark:text-white">User list</h3> `);

			ListgroupItem($$renderer, {
				class: 'gap-2 text-base font-semibold',
				children: ($$renderer) => {
					Avatar($$renderer, { src: '/images/profile-picture-1.webp', size: 'xs' });
					$$renderer.push(`<!---->Jese Leos`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ListgroupItem($$renderer, {
				class: 'gap-2 text-base font-semibold',
				children: ($$renderer) => {
					Avatar($$renderer, { src: '/images/profile-picture-2.webp', size: 'xs' });
					$$renderer.push(`<!---->Robert Gouth`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ListgroupItem($$renderer, {
				class: 'gap-2 text-base font-semibold',
				children: ($$renderer) => {
					Avatar($$renderer, { src: '/images/profile-picture-3.webp', size: 'xs' });
					$$renderer.push(`<!---->Bonnie Green`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <a href="/" class="flex items-center rounded-b-lg bg-gray-50 p-3 text-sm font-medium text-red-600 hover:bg-gray-100 hover:underline dark:bg-gray-700 dark:text-red-500 dark:hover:bg-gray-600">`);
			TrashBinSolid($$renderer, { class: 'ms-1 me-2 h-6 w-6' });
			$$renderer.push(`<!----> Delete user</a>`);
		},
		$$slots: { default: true }
	});
}