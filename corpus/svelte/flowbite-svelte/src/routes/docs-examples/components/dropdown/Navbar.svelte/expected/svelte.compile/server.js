import * as $ from 'svelte/internal/server';

import {
	Dropdown,
	DropdownItem,
	Navbar,
	NavBrand,
	NavHamburger,
	NavUl,
	NavLi
} from "flowbite-svelte";

import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function Navbar_1($$renderer) {
	Navbar($$renderer, {
		children: ($$renderer) => {
			NavBrand($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			NavHamburger($$renderer, {});
			$$renderer.push(`<!----> `);

			NavUl($$renderer, {
				class: 'ms-3 pt-1',
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
						class: 'cursor-pointer',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dropdown`);

							ChevronDownOutline($$renderer, {
								class: 'text-primary-800 ms-2 inline h-6 w-6 dark:text-white'
							});

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

					$$renderer.push(`<!----> `);

					NavLi($$renderer, {
						href: '/services',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Services`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					NavLi($$renderer, {
						href: '/pricing',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Pricing`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					NavLi($$renderer, {
						href: '/contact',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Contact`);
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
}