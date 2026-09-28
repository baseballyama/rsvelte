import * as $ from 'svelte/internal/server';
import { page } from "$app/state";

import {
	Banner,
	DarkMode,
	Navbar,
	NavBrand,
	NavHamburger,
	NavLi,
	NavUl
} from "$lib";

import Tooltip from "$lib/tooltip/Tooltip.svelte";
import { onMount } from "svelte";
import Discord from "../utils/icons/Discord.svelte";
import GitHub from "../utils/icons/GitHub.svelte";
import YouTube from "../utils/icons/YouTube.svelte";
import ToolbarLink from "../utils/ToolbarLink.svelte";
import AlgoliaSearch from "../utils/AlgoliaSearch.svelte";
import Badge from "$lib/badge/Badge.svelte";

export default function FlowbiteSvelteLayout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let isHomePage = $.derived(() => page.route.id === "/");

		/*eslint no-undef: "off"*/
		const version = __VERSION__;

		let logo = "/images/flowbite-svelte-icon-logo.svg";

		// let divClass = 'w-full ms-auto lg:block lg:w-auto order-1 lg:order-none';
		let activeUrl = $.derived(() => page.url.pathname);

		// const drawerHiddenStore: Writable<boolean> = writable<boolean>(true);
		// setContext("drawer", drawerHiddenStore);
		// setContext("testC", "test for textContext");
		// const toggleDrawer = () => {
		//   drawerHiddenStore.update((state) => !state);
		// };
		// const toggle = () => {};
		const BANNER_KEY = "top-banner-dismissed-until";

		const BANNER_DURATION_MS = 24 * 60 * 60 * 1000;
		let bannerOpen = false;

		function onBannerClose(_event) {
			const until = Date.now() + BANNER_DURATION_MS;

			try {
				localStorage.setItem(BANNER_KEY, String(until));
			} catch {
				// ignore storage failures
			}

			bannerOpen = false;
		}

		onMount(() => {
			try {
				const raw = localStorage.getItem(BANNER_KEY);
				const until = raw ? Number(raw) : NaN;

				bannerOpen = !Number.isFinite(until) || Date.now() > until;
			} catch {
				bannerOpen = true;
			}

			// Workaround until https://github.com/sveltejs/kit/issues/2664 is fixed
			if (typeof window !== "undefined" && window.location.hash) {
				const deepLinkedElement = document.getElementById(window.location.hash.substring(1));

				if (deepLinkedElement) {
					window.setTimeout(() => deepLinkedElement.scrollIntoView(), 100);
				}
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Banner($$renderer, {
				color: 'yellow',
				class: 'sticky top-0 z-50',
				onclose: onBannerClose,
				get open() {
					return bannerOpen;
				},

				set open($$value) {
					bannerOpen = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<p class="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-300"><svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg> Flowbite Svelte v2 is coming soon! <a href="https://flowbite-svelte-v2.vercel.app/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline">Check it out →</a></p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <header class="sticky top-0 z-40 mx-auto w-full flex-none border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900">`);

			Navbar($$renderer, {
				color: 'default',
				fluid: true,
				class: 'mx-auto flex w-full items-center justify-between px-4 py-1.5',
				children: ($$renderer) => {
					NavBrand($$renderer, {
						href: '/',
						class: 'pl-8 lg:pl-0',
						children: ($$renderer) => {
							$$renderer.push(`<img${$.attr('src', logo)} class="me-3 h-8" alt="Flowbite Svelte Logo"/> <span class="hidden self-center text-2xl font-semibold whitespace-nowrap text-gray-900 lg:block dark:text-white">Flowbite Svelte</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (!isHomePage()) {
						$$renderer.push('<!--[0-->');
						AlgoliaSearch($$renderer, {});
					} else {
						$$renderer.push(`<!--[-1--><div id="home">`);
						AlgoliaSearch($$renderer, {});
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--> `);

					NavUl($$renderer, {
						activeUrl: activeUrl(),
						class: 'order-1 ml-auto w-full lg:order-none lg:block lg:w-auto',
						classes: {
							ul: "flex flex-col lg:flex-row lg:my-0 text-sm font-medium text-gray-900 dark:text-gray-300 gap-4"
						},

						children: ($$renderer) => {
							NavLi($$renderer, {
								class: 'lg:mb-0 lg:px-2',
								href: '/docs/pages/introduction',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Docs`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								class: 'lg:mb-0 lg:px-2',
								href: '/docs/components/accordion',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Components`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								class: 'lg:mb-0 lg:px-2',
								href: '/blocks',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Blocks`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								class: 'lg:mb-0 lg:px-2',
								href: '/admin-dashboard',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Dashboard`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								class: 'lg:mb-0 lg:px-2',
								href: '/icons/quickstart',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Icons`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								class: 'lg:mb-0 lg:px-2',
								href: '/illustrations/illustrations',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Illustrations`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="order-1 ml-auto flex items-center lg:order-2">`);

					ToolbarLink($$renderer, {
						class: 'hidden hover:text-gray-900 xl:inline-block dark:hover:text-white',
						name: 'View on GitHub',
						href: 'https://github.com/themesberg/flowbite-svelte',
						children: ($$renderer) => {
							GitHub($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarLink($$renderer, {
						class: 'hidden hover:text-gray-900 xl:inline-block dark:hover:text-white',
						name: 'Join community on Discord',
						href: 'https://discord.gg/4eeurUVvTy',
						children: ($$renderer) => {
							Discord($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToolbarLink($$renderer, {
						class: 'hidden hover:text-gray-900 xl:inline-block dark:hover:text-white',
						name: 'Subscribe to YouTube channel',
						href: 'https://www.youtube.com/channel/UC_Ms4V2kYDsh7F_CSsHyQ6A',
						children: ($$renderer) => {
							YouTube($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					DarkMode($$renderer, {
						size: 'lg',
						class: 'inline-block hover:text-gray-900 dark:hover:text-white'
					});

					$$renderer.push(`<!----> `);

					Tooltip($$renderer, {
						class: 'dark:bg-gray-900',
						placement: 'bottom-end',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Toggle dark mode`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <a href="https://www.npmjs.com/package/flowbite-svelte" class="order-4 hidden xl:block">`);

					Badge($$renderer, {
						large: true,
						class: 'hover:bg-primary-600 dark:hover:bg-primary-800 ms-2 hover:text-white xl:ms-6 dark:hover:text-white',
						children: ($$renderer) => {
							$$renderer.push(`<!---->v${$.escape(version)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></a> `);
					NavHamburger($$renderer, { class: 'order-3 m-0 ml-3 lg:hidden' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></header> <div class="md:mx-auto lg:flex">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}