import * as $ from 'svelte/internal/server';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline, ChevronUpOutline } from "flowbite-svelte-icons";

export default function Double($$renderer) {
	let placement = "left";

	$$renderer.push(`<div>`);

	Button($$renderer, {
		'data-placement': 'left-start',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Left start`);
			ChevronUpOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-placement': 'right-end',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Right end`);
			ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Dropdown($$renderer, {
		simple: true,
		placement,
		triggeredBy: '[data-placement]',
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
}