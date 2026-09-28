import * as $ from 'svelte/internal/server';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline, ChevronRightOutline } from "flowbite-svelte-icons";

export default function Multilevel($$renderer) {
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
		simple: true,
		children: ($$renderer) => {
			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dashboard`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				class: 'flex items-center justify-between',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dropdown`);
					ChevronRightOutline($$renderer, { class: 'text-primary-700 ms-2 h-6 w-6 dark:text-white' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Dropdown($$renderer, {
				simple: true,
				placement: 'right-start',
				children: ($$renderer) => {
					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Overview`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->My downloads`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DropdownItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Billing`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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
}