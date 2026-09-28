import * as $ from 'svelte/internal/server';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function Events($$renderer) {
	const handleClick = (e) => {
		e.preventDefault();
		alert("Clicked on: " + e.target);
	};

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
				href: '/link',
				onclick: handleClick,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Rendered as link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				onclick: handleClick,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Rendered as button`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}