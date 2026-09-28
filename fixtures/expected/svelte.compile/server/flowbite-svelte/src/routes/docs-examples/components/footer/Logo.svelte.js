import * as $ from 'svelte/internal/server';

import {
	Footer,
	FooterCopyright,
	FooterLinkGroup,
	FooterBrand,
	FooterLink
} from "flowbite-svelte";

export default function Logo($$renderer) {
	Footer($$renderer, {
		footerType: 'logo',
		children: ($$renderer) => {
			$$renderer.push(`<div class="sm:flex sm:items-center sm:justify-between">`);

			FooterBrand($$renderer, {
				href: 'https://flowbite.com',
				src: '/images/flowbite-svelte-icon-logo.svg',
				alt: 'Flowbite Logo',
				name: 'Flowbite'
			});

			$$renderer.push(`<!----> `);

			FooterLinkGroup($$renderer, {
				class: 'mb-6 flex flex-wrap items-center text-sm text-gray-500 sm:mb-0 dark:text-gray-400',
				children: ($$renderer) => {
					FooterLink($$renderer, {
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->About`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Privacy Policy`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Licensing`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Contact`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <hr class="my-6 border-gray-200 sm:mx-auto lg:my-8 dark:border-gray-700"/> `);
			FooterCopyright($$renderer, { href: '/', by: 'Flowbite™' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}