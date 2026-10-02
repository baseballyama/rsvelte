import * as $ from 'svelte/internal/server';

import {
	Dropdown,
	DropdownItem,
	Avatar,
	DropdownHeader,
	DropdownGroup
} from "flowbite-svelte";

export default function User($$renderer) {
	Avatar($$renderer, {
		class: 'acs',
		src: '/images/profile-picture-3.webp',
		dot: { color: "green" }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		triggeredBy: '.acs',
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