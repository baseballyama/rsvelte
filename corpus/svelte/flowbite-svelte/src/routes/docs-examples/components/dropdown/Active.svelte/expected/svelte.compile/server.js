import * as $ from 'svelte/internal/server';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";
import { page } from "$app/state";

export default function Active($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = $.derived(() => page.url.pathname);
		let activeClass = "text-green-500 dark:text-green-300 hover:text-green-700 dark:hover:text-green-500";

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
			activeUrl: activeUrl(),
			class: activeClass,
			simple: true,
			children: ($$renderer) => {
				DropdownItem($$renderer, {
					href: '/',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Home`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DropdownItem($$renderer, {
					href: '/docs/components/dropdown',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Dropdown`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DropdownItem($$renderer, {
					href: '/docs/components/accordion',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Accordion`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DropdownItem($$renderer, {
					href: '/docs/components/alert',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Alert`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}