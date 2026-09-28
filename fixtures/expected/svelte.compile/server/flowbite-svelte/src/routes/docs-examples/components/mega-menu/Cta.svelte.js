import * as $ from 'svelte/internal/server';
import { Navbar, NavBrand, NavHamburger, NavUl, NavLi, MegaMenu } from "flowbite-svelte";
import { ChevronDownOutline, ArrowRightOutline } from "flowbite-svelte-icons";

export default function Cta($$renderer) {
	let menu = [
		{ name: "About us", href: "/about" },
		{ name: "Blog", href: "/blog" },
		{ name: "Contact us", href: "/contact" },
		{ name: "Library", href: "/library" },
		{ name: "Newsletter", href: "/news" },
		{ name: "Support Center", href: "/support" },
		{ name: "Resources", href: "/resource" },
		{ name: "Playground", href: "/play" },
		{ name: "Terms", href: "/tersm" },
		{ name: "Pro Version", href: "/pro" },
		{ name: "License", href: "/license" }
	];

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
							$$renderer.push(`<!---->Company`);

							ChevronDownOutline($$renderer, {
								class: 'text-primary-800 ms-2 inline h-6 w-6 dark:text-white'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { item }) {
							$$renderer.push(`<a${$.attr('href', item.href)} class="hover:text-primary-600 dark:hover:text-primary-500 hover:underline">${$.escape(item.name)}</a>`);
						}

						function extra($$renderer) {
							$$renderer.push(`<h2 class="mt-4 mb-2 font-semibold text-gray-900 dark:text-white">Our brands</h2> <p class="mb-2 p-0 text-sm font-light text-gray-500 dark:text-gray-300">At Flowbite, we have a portfolio of brands that cater to a variety of preferences.</p> <a href="/" class="text-primary-600 hover:text-primary-600 dark:text-primary-500 dark:hover:text-primary-700 inline-flex items-center text-sm font-medium hover:underline">Explore our brands <span class="sr-only">Explore our brands</span> `);

							ArrowRightOutline($$renderer, {
								class: 'text-primary-600 hover:text-primary-600 dark:text-primary-500 dark:hover:text-primary-700  ms-2 h-6 w-6'
							});

							$$renderer.push(`<!----></a>`);
						}

						MegaMenu($$renderer, {
							full: true,
							items: menu,
							children,
							extra,
							$$slots: { default: true, extra: true }
						});
					}

					$$renderer.push(`<!----> `);

					NavLi($$renderer, {
						href: '/services',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Marketplace`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					NavLi($$renderer, {
						href: '/services',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Resources`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					NavLi($$renderer, {
						href: '/services',
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