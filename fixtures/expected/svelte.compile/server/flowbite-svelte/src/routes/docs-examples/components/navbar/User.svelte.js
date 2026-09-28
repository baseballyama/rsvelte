import * as $ from 'svelte/internal/server';

import {
	Navbar,
	NavBrand,
	NavLi,
	NavUl,
	NavHamburger,
	Avatar,
	Dropdown,
	DropdownItem,
	DropdownHeader,
	DropdownGroup
} from "flowbite-svelte";

export default function User($$renderer) {
	Navbar($$renderer, {
		children: ($$renderer) => {
			NavBrand($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex items-center md:order-2">`);
			Avatar($$renderer, { id: 'avatar-menu', src: '/images/profile-picture-3.webp' });
			$$renderer.push(`<!----> `);
			NavHamburger($$renderer, {});
			$$renderer.push(`<!----></div> `);

			Dropdown($$renderer, {
				placement: 'bottom',
				triggeredBy: '#avatar-menu',
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

			$$renderer.push(`<!----> `);

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