import * as $ from 'svelte/internal/server';

import {
	Button,
	Dropdown,
	DropdownItem,
	Avatar,
	DropdownHeader,
	DropdownGroup
} from "flowbite-svelte";

export default function Avatar_1($$renderer) {
	Button($$renderer, {
		pill: true,
		color: 'light',
		id: 'avatar_with_name',
		class: 'p-1!',
		children: ($$renderer) => {
			Avatar($$renderer, { src: '/images/profile-picture-3.webp', class: 'me-2' });
			$$renderer.push(`<!----> Bonnie Green`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		triggeredBy: '#avatar_with_name',
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

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownHeader($$renderer, {
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
}