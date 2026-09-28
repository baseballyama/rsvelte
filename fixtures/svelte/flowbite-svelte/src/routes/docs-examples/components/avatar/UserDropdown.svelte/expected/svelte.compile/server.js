import * as $ from 'svelte/internal/server';

import {
	Avatar,
	Dropdown,
	DropdownHeader,
	DropdownItem,
	DropdownGroup
} from "flowbite-svelte";

export default function UserDropdown($$renderer) {
	Avatar($$renderer, {
		id: 'user-drop',
		src: '/images/profile-picture-3.webp',
		class: 'cursor-pointer',
		dot: { color: "green" }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		triggeredBy: '#user-drop',
		children: ($$renderer) => {
			DropdownHeader($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<span class="block text-sm">Bonnie Green</span> <span class="block truncate text-sm font-medium">name@flowbite.com</span>`);
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

			DropdownGroup($$renderer, {
				children: ($$renderer) => {
					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Sign out`);
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

	$$renderer.push(`<!---->`);
}