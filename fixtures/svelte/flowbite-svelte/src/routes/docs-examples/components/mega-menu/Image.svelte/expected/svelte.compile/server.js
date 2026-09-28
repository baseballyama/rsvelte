import * as $ from 'svelte/internal/server';

import {
	Navbar,
	NavBrand,
	NavHamburger,
	NavUl,
	NavLi,
	MegaMenu,
	Button
} from "flowbite-svelte";

import { resolve } from "$app/paths";
import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function Image($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
					href: resolve("/"),
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
								$$renderer.push(`<!---->Mega menu`);

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
								$$renderer.push(`<a${$.attr('href', resolve("/"))} class="mt-4 block rounded-lg bg-gray-500 bg-cover bg-local bg-center bg-no-repeat p-4 text-left bg-blend-multiply hover:bg-blend-soft-light dark:hover:bg-blend-darken" style="background-image: url(/images/dashboard-overview.png)"><p class="mb-5 max-w-xl p-0 text-sm leading-tight font-extrabold tracking-tight text-white">Preview the new Flowbite dashboard navigation.</p> `);

								Button($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Get started`);
									},
									$$slots: { default: true }
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
								$$renderer.push(`<!---->Services`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						NavLi($$renderer, {
							href: '/services',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Products`);
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
	});
}