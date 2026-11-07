import * as $ from 'svelte/internal/server';
import { Navbar, NavBrand, NavHamburger, NavUl, NavLi, MegaMenu } from "flowbite-svelte";
import { ChevronDownOutline, UserCircleOutline } from "flowbite-svelte-icons";

export default function Icons($$renderer) {
	let menu = [
		{ name: "About us", href: "/about", icon: UserCircleOutline },
		{ name: "Blog", href: "/blog", icon: UserCircleOutline },
		{
			name: "Contact us",
			href: "/contact",
			icon: UserCircleOutline
		},
		{ name: "Library", href: "/library", icon: UserCircleOutline },
		{ name: "Newsletter", href: "/news", icon: UserCircleOutline },
		{
			name: "Support Center",
			href: "/support",
			icon: UserCircleOutline
		},

		{
			name: "Resources",
			href: "/resource",
			icon: UserCircleOutline
		},
		{ name: "Playground", href: "/play", icon: UserCircleOutline },
		{ name: "Terms", href: "/tersm", icon: UserCircleOutline },
		{ name: "Pro Version", href: "/pro", icon: UserCircleOutline },
		{ name: "License", href: "/license", icon: UserCircleOutline }
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
							$$renderer.push(`<a${$.attr('href', item.href)} class="hover:text-primary-600 dark:hover:text-primary-500 flex items-center"><span class="sr-only">${$.escape(item.name)}</span> `);

							if (item.icon) {
								$$renderer.push('<!--[-->');
								item.icon($$renderer, { class: 'me-2 h-4 w-4' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`${$.escape(item.name)}</a>`);
						}

						MegaMenu($$renderer, { items: menu, children, $$slots: { default: true } });
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
}