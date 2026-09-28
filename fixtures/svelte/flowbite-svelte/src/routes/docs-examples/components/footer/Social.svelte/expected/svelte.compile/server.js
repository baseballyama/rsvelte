import * as $ from 'svelte/internal/server';

import {
	Footer,
	FooterCopyright,
	FooterLinkGroup,
	FooterLink,
	FooterBrand,
	FooterIcon
} from "flowbite-svelte";

import { FacebookSolid, GithubSolid, DiscordSolid, TwitterSolid } from "flowbite-svelte-icons";
import Dribble from "$icons/Dribble.svelte";

export default function Social($$renderer) {
	Footer($$renderer, {
		footerType: 'socialmedia',
		children: ($$renderer) => {
			$$renderer.push(`<div class="md:flex md:justify-between"><div class="mb-6 md:mb-0">`);

			FooterBrand($$renderer, {
				href: 'https://flowbite.com',
				src: '/images/flowbite-svelte-icon-logo.svg',
				alt: 'Flowbite Logo',
				name: 'Flowbite'
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6"><div><h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Resources</h2> `);

			FooterLinkGroup($$renderer, {
				children: ($$renderer) => {
					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Flowbite`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tailwind CSS`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div><h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Follow us</h2> `);

			FooterLinkGroup($$renderer, {
				children: ($$renderer) => {
					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->GitHub`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					FooterLink($$renderer, {
						class: 'mb-4',
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Discord`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div><h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Legal</h2> `);

			FooterLinkGroup($$renderer, {
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
							$$renderer.push(`<!---->Terms &amp; Conditions`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div></div> <hr class="my-6 border-gray-200 sm:mx-auto lg:my-8 dark:border-gray-700"/> <div class="sm:flex sm:items-center sm:justify-between">`);
			FooterCopyright($$renderer, { href: '/', by: 'Flowbite™' });
			$$renderer.push(`<!----> <div class="mt-4 flex space-x-6 sm:mt-0 sm:justify-center rtl:space-x-reverse">`);

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