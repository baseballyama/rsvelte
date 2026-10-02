import * as $ from 'svelte/internal/server';
import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, P } from "flowbite-svelte";

export default function Breakpoint($$renderer) {
	Navbar($$renderer, {
		breakpoint: 'lg',
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

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequuntur quos impedit quo, quis quam in distinctio deleniti facere! Ea aliquid maiores iusto obcaecati rerum quisquam repellendus
  dignissimos rem quo veritatis.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Lorem ipsum, dolor sit amet consectetur adipisicing elit. Consequuntur quos impedit quo, quis quam in distinctio deleniti facere! Ea aliquid maiores iusto obcaecati rerum quisquam repellendus
  dignissimos rem quo veritatis.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}