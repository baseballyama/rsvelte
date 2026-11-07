import * as $ from 'svelte/internal/server';

import {
	Footer,
	FooterLinkGroup,
	FooterLink,
	ImagePlaceholder,
	TextPlaceholder,
	Skeleton,
	FooterCopyright
} from "flowbite-svelte";

export default function Sticky($$renderer) {
	$$renderer.push(`<div style="height:300px;" class="overflow-scroll pb-16">`);
	Skeleton($$renderer, { class: 'my-8' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { class: 'my-8' });
	$$renderer.push(`<!----> `);
	TextPlaceholder($$renderer, { class: 'my-8' });
	$$renderer.push(`<!----></div> `);

	Footer($$renderer, {
		class: 'absolute start-0 bottom-0 z-20 w-full border-t border-gray-200 bg-white p-4 shadow-sm md:flex md:items-center md:justify-between md:p-6 dark:border-gray-600 dark:bg-gray-800',
		children: ($$renderer) => {
			FooterCopyright($$renderer, { href: '/', by: 'Flowbite™', year: 2022 });
			$$renderer.push(`<!----> `);

			FooterLinkGroup($$renderer, {
				class: 'mt-3 flex flex-wrap items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400',
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}