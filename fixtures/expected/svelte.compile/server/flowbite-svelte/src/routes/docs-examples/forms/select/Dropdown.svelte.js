import * as $ from 'svelte/internal/server';
import { Select, Button, ButtonGroup, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";
import Usa from "$icons/Usa.svelte";
import Germany from "$icons/Germany.svelte";
import Italy from "$icons/Italy.svelte";
import China from "$icons/China.svelte";

export default function Dropdown_1($$renderer) {
	let states = [
		{ value: "CA", name: "California" },
		{ value: "TX", name: "Texas" },
		{ value: "WH", name: "Washinghton" },
		{ value: "FL", name: "Florida" },
		{ value: "VG", name: "Virginia" },
		{ value: "GE", name: "Georgia" },
		{ value: "MI", name: "Michigan" }
	];

	ButtonGroup($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			Button($$renderer, {
				class: 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-500 focus:ring-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700',
				children: ($$renderer) => {
					Usa($$renderer, {});
					$$renderer.push(`<!----> USA `);
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
						class: 'flex items-center',
						children: ($$renderer) => {
							Usa($$renderer, {});
							$$renderer.push(`<!----> United States`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						class: 'flex items-center',
						children: ($$renderer) => {
							Germany($$renderer, {});
							$$renderer.push(`<!----> Germany`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						class: 'flex items-center',
						children: ($$renderer) => {
							Italy($$renderer, {});
							$$renderer.push(`<!----> Italy`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						class: 'flex items-center',
						children: ($$renderer) => {
							China($$renderer, {});
							$$renderer.push(`<!----> China`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Select($$renderer, { items: states, placeholder: 'Choose the state' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}