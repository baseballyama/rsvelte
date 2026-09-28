import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from "flowbite-svelte";

export default function Active($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeUrl = $.derived(() => page.url.pathname);

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