import * as $ from 'svelte/internal/server';

import {
	Navbar,
	NavBrand,
	NavLi,
	NavUl,
	NavHamburger,
	ImagePlaceholder,
	Skeleton,
	TextPlaceholder
} from "flowbite-svelte";

export default function Sticky($$renderer) {
	$$renderer.push(`<div class="relative px-8">`);

	Navbar($$renderer, {
		class: 'sticky start-0 top-0 z-20 w-full bg-white px-2 py-2.5 sm:px-4 dark:bg-gray-800',
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

	$$renderer.push(`<!----> <div style="height:300px;" class="overflow-scroll pb-16">`);
	Skeleton($$renderer, { class: 'mt-4 mb-8' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { class: 'my-8' });
	$$renderer.push(`<!----> `);
	TextPlaceholder($$renderer, { class: 'my-8' });
	$$renderer.push(`<!----></div></div>`);
}