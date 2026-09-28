import * as $ from 'svelte/internal/server';
import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button } from "flowbite-svelte";

export default function Cta($$renderer) {
	Navbar($$renderer, {
		children: ($$renderer) => {
			NavBrand($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="flex md:order-2">`);

			Button($$renderer, {
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Get started`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			NavHamburger($$renderer, {});
			$$renderer.push(`<!----></div> `);

			NavUl($$renderer, {
				class: 'order-1',
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