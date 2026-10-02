import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<p class="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-300"><svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg> Flowbite Svelte v2 is coming soon! <a href="https://flowbite-svelte-v2.vercel.app/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline">Check it out →</a></p>`);
var root_1 = $.from_html(`<img class="me-3 h-8" alt="Flowbite Svelte Logo"/> <span class="hidden self-center text-2xl font-semibold whitespace-nowrap text-gray-900 lg:block dark:text-white">Flowbite Svelte</span>`, 1);
var root_2 = $.from_html(`<div id="home"><!></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <div class="order-1 ml-auto flex items-center lg:order-2"><!> <!> <!> <!> <!></div> <a href="https://www.npmjs.com/package/flowbite-svelte" class="order-4 hidden xl:block"><!></a> <!>`, 1);
var root_5 = $.from_html(`<!> <header class="sticky top-0 z-40 mx-auto w-full flex-none border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900"><!></header> <div class="md:mx-auto lg:flex"><!></div>`, 1);

export default function FlowbiteSvelteLayout($$anchor, $$props) {
	$.push($$props, true);

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
	let bannerOpen = $.state(false);

	function onBannerClose(_event) {
		const until = Date.now() + BANNER_DURATION_MS;

		try {
			localStorage.setItem(BANNER_KEY, String(until));
		} catch {
			// ignore storage failures
		}

		$.set(bannerOpen, false);
	}

	onMount(() => {
		try {
			const raw = localStorage.getItem(BANNER_KEY);
			const until = raw ? Number(raw) : NaN;

			$.set(bannerOpen, !Number.isFinite(until) || Date.now() > until, true);
		} catch {
			$.set(bannerOpen, true);
		}

		// Workaround until https://github.com/sveltejs/kit/issues/2664 is fixed
		if (typeof window !== "undefined" && window.location.hash) {
			const deepLinkedElement = document.getElementById(window.location.hash.substring(1));

			if (deepLinkedElement) {
				window.setTimeout(() => deepLinkedElement.scrollIntoView(), 100);
			}
		}
	});

	var fragment = root_5();
	var node = $.first_child(fragment);

	Banner(node, {
		color: 'yellow',
		class: 'sticky top-0 z-50',
		onclose: onBannerClose,
		get open() {
			return $.get(bannerOpen);
		},

		set open($$value) {
			$.set(bannerOpen, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	var header = $.sibling(node, 2);
	var node_1 = $.child(header);

	Navbar(node_1, {
		color: 'default',
		fluid: true,
		class: 'mx-auto flex w-full items-center justify-between px-4 py-1.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node_2 = $.first_child(fragment_1);

			NavBrand(node_2, {
				href: '/',
				class: 'pl-8 lg:pl-0',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var img = $.first_child(fragment_2);

					$.set_attribute(img, 'src', logo);
					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent = ($$anchor) => {
					AlgoliaSearch($$anchor, {});
				};

				var alternate = ($$anchor) => {
					var div = root_2();
					var node_4 = $.child(div);

					AlgoliaSearch(node_4, {});
					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node_3, ($$render) => {
					if (!$.get(isHomePage)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_5 = $.sibling(node_3, 2);

			NavUl(node_5, {
				get activeUrl() {
					return $.get(activeUrl);
				},
				class: 'order-1 ml-auto w-full lg:order-none lg:block lg:w-auto',
				classes: {
					ul: "flex flex-col lg:flex-row lg:my-0 text-sm font-medium text-gray-900 dark:text-gray-300 gap-4"
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_6 = $.first_child(fragment_4);

					NavLi(node_6, {
						class: 'lg:mb-0 lg:px-2',
						href: '/docs/pages/introduction',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Docs');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					NavLi(node_7, {
						class: 'lg:mb-0 lg:px-2',
						href: '/docs/components/accordion',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Components');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					NavLi(node_8, {
						class: 'lg:mb-0 lg:px-2',
						href: '/blocks',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Blocks');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					NavLi(node_9, {
						class: 'lg:mb-0 lg:px-2',
						href: '/admin-dashboard',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Dashboard');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					NavLi(node_10, {
						class: 'lg:mb-0 lg:px-2',
						href: '/icons/quickstart',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Icons');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					NavLi(node_11, {
						class: 'lg:mb-0 lg:px-2',
						href: '/illustrations/illustrations',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Illustrations');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_5, 2);
			var node_12 = $.child(div_1);

			ToolbarLink(node_12, {
				class: 'hidden hover:text-gray-900 xl:inline-block dark:hover:text-white',
				name: 'View on GitHub',
				href: 'https://github.com/themesberg/flowbite-svelte',
				children: ($$anchor, $$slotProps) => {
					GitHub($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			ToolbarLink(node_13, {
				class: 'hidden hover:text-gray-900 xl:inline-block dark:hover:text-white',
				name: 'Join community on Discord',
				href: 'https://discord.gg/4eeurUVvTy',
				children: ($$anchor, $$slotProps) => {
					Discord($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			ToolbarLink(node_14, {
				class: 'hidden hover:text-gray-900 xl:inline-block dark:hover:text-white',
				name: 'Subscribe to YouTube channel',
				href: 'https://www.youtube.com/channel/UC_Ms4V2kYDsh7F_CSsHyQ6A',
				children: ($$anchor, $$slotProps) => {
					YouTube($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			DarkMode(node_15, {
				size: 'lg',
				class: 'inline-block hover:text-gray-900 dark:hover:text-white'
			});

			var node_16 = $.sibling(node_15, 2);

			Tooltip(node_16, {
				class: 'dark:bg-gray-900',
				placement: 'bottom-end',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Toggle dark mode');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var a = $.sibling(div_1, 2);
			var node_17 = $.child(a);

			Badge(node_17, {
				large: true,
				class: 'hover:bg-primary-600 dark:hover:bg-primary-800 ms-2 hover:text-white xl:ms-6 dark:hover:text-white',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text();

					$.template_effect(() => $.set_text(text_7, `v${version ?? ''}`));
					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.reset(a);

			var node_18 = $.sibling(a, 2);

			NavHamburger(node_18, { class: 'order-3 m-0 ml-3 lg:hidden' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(header);

	var div_2 = $.sibling(header, 2);
	var node_19 = $.child(div_2);

	$.snippet(node_19, () => $$props.children);
	$.reset(div_2);
	$.append($$anchor, fragment);
	$.pop();
}