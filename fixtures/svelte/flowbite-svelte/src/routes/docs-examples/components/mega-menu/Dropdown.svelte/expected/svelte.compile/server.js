import * as $ from 'svelte/internal/server';
import { Navbar, NavBrand, NavHamburger, NavUl, NavLi, MegaMenu } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function Dropdown($$renderer) {
	let menu2 = [
		{
			name: "Online Stores",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Segmentation",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Marketing CRM",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Online Stores",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Segmentation",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Marketing CRM",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Audience Management",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Creative Tools",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Marketing Automation",
			help: "Connect with third-party tools that you're already using."
		}
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
							$$renderer.push(`<a href="/" class="block h-full rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700"><div class="font-semibold dark:text-white">${$.escape(item.name)}</div> <span class="text-sm font-light text-gray-500 dark:text-gray-400">${$.escape(item.help)}</span></a>`);
						}

						MegaMenu($$renderer, {
							full: true,
							items: menu2,
							children,
							$$slots: { default: true }
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
}