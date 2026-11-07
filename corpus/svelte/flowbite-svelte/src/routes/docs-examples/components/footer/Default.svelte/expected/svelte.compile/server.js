import * as $ from 'svelte/internal/server';
import { Footer, FooterCopyright, FooterLinkGroup, FooterLink } from "flowbite-svelte";

export default function Default($$renderer) {
	Footer($$renderer, {
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
}