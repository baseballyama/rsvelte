import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from "flowbite-svelte";

export default function ActiveClass($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = $.derived(() => page.url.pathname);
		let activeClass = "text-white bg-green-700 md:bg-transparent md:text-green-700 md:dark:text-white dark:bg-green-600 md:dark:bg-transparent";
		let nonActiveClass = "text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-green-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent";

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
					activeUrl: activeUrl(),
					classes: { active: activeClass, nonActive: nonActiveClass },
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
							href: '/docs/components/navbar',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Navbar`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						NavLi($$renderer, {
							href: '/docs/components/accordion',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Accordion`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						NavLi($$renderer, {
							href: '/docs/components/alert',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Alert`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						NavLi($$renderer, {
							href: '/docs/components/avatar',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Avatar`);
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