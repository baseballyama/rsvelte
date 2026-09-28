import * as $ from 'svelte/internal/server';

import {
	Navbar,
	NavBrand,
	NavLi,
	NavUl,
	NavHamburger,
	Search,
	ToolbarButton
} from "flowbite-svelte";

import { SearchOutline } from "flowbite-svelte-icons";
import { fade } from "svelte/transition";

export default function Search_1($$renderer) {
	{
		function children($$renderer, { hidden, toggle }) {
			NavBrand($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex md:order-2">`);

			ToolbarButton($$renderer, {
				class: 'block md:hidden',
				onclick: toggle,
				children: ($$renderer) => {
					SearchOutline($$renderer, { class: 'h-5 w-5 text-gray-500 dark:text-gray-400' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="hidden md:block">`);
			Search($$renderer, { size: 'md', class: 'ms-auto', placeholder: 'Search...' });
			$$renderer.push(`<!----></div> `);
			NavHamburger($$renderer, {});
			$$renderer.push(`<!----></div> `);

			if (!hidden) {
				$$renderer.push(`<!--[0--><div class="mt-2 w-full md:hidden">`);
				Search($$renderer, { size: 'md', placeholder: 'Search...' });
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			NavUl($$renderer, {
				children: ($$renderer) => {
					NavLi($$renderer, {
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Home`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					NavLi($$renderer, {
						href: '/about',
						children: ($$renderer) => {
							$$renderer.push(`<!---->About`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					NavLi($$renderer, {
						href: '/docs/components/navbar',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Navbar`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		Navbar($$renderer, { children, $$slots: { default: true } });
	}
}