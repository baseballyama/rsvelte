import * as $ from 'svelte/internal/server';

import {
	Footer,
	FooterLinkGroup,
	FooterLink,
	FooterIcon,
	FooterCopyright
} from "flowbite-svelte";

import { FacebookSolid, GithubSolid, DiscordSolid, TwitterSolid } from "flowbite-svelte-icons";
import Dribble from "$icons/Dribble.svelte";

export default function Sitemap($$renderer) {
	Footer($$renderer, {
		footerType: 'sitemap',
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-2 gap-8 px-6 py-8 md:grid-cols-4"><div><h2 class="mb-6 text-sm font-semibold text-gray-400 uppercase">Company</h2> `);

			FooterLinkGroup($$renderer, {
				class: 'text-gray-900 dark:text-gray-200',
				children: ($$renderer) => {
					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->About`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Careers`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Brand Center`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Blog`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div><h2 class="mb-6 text-sm font-semibold text-gray-400 uppercase">Download</h2> `);

			FooterLinkGroup($$renderer, {
				class: 'text-gray-900 dark:text-gray-200',
				children: ($$renderer) => {
					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Discord Server`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Twitter`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Facebook`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Contact Us`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div><h2 class="mb-6 text-sm font-semibold text-gray-400 uppercase">Legal</h2> `);

			FooterLinkGroup($$renderer, {
				class: 'text-gray-900 dark:text-gray-200',
				children: ($$renderer) => {
					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Privacy Policy`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Licensing`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Terms &amp; Conditions`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div><h2 class="mb-6 text-sm font-semibold text-gray-400 uppercase">Download</h2> `);

			FooterLinkGroup($$renderer, {
				class: 'text-gray-900 dark:text-gray-200',
				children: ($$renderer) => {
					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->iOS`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Android`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Windows`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->MacOS`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> <div class="bg-gray-100 px-4 py-6 md:flex md:items-center md:justify-between dark:bg-gray-700">`);

			FooterCopyright($$renderer, {
				class: 'text-sm text-gray-900 sm:text-center dark:text-gray-200',
				href: '/',
				by: 'Flowbite™'
			});

			$$renderer.push(`<!----> <div class="mt-4 flex space-x-6 sm:justify-center md:mt-0 rtl:space-x-reverse">`);

			FooterIcon($$renderer, {
				href: '/',
				children: ($$renderer) => {
					FacebookSolid($$renderer, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			FooterIcon($$renderer, {
				href: '/',
				children: ($$renderer) => {
					DiscordSolid($$renderer, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			FooterIcon($$renderer, {
				href: '/',
				children: ($$renderer) => {
					TwitterSolid($$renderer, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			FooterIcon($$renderer, {
				href: '/',
				children: ($$renderer) => {
					GithubSolid($$renderer, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			FooterIcon($$renderer, {
				href: '/',
				children: ($$renderer) => {
					Dribble($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}