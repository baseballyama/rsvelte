import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Footer,
	FooterLinkGroup,
	FooterLink,
	FooterIcon,
	FooterCopyright
} from "flowbite-svelte";

import { FacebookSolid, GithubSolid, DiscordSolid, TwitterSolid } from "flowbite-svelte-icons";
import Dribble from "$icons/Dribble.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-2 gap-8 px-6 py-8 md:grid-cols-4"><div><h2 class="mb-6 text-sm font-semibold text-gray-400 uppercase">Company</h2> <!></div> <div><h2 class="mb-6 text-sm font-semibold text-gray-400 uppercase">Download</h2> <!></div> <div><h2 class="mb-6 text-sm font-semibold text-gray-400 uppercase">Legal</h2> <!></div> <div><h2 class="mb-6 text-sm font-semibold text-gray-400 uppercase">Download</h2> <!></div></div> <div class="bg-gray-100 px-4 py-6 md:flex md:items-center md:justify-between dark:bg-gray-700"><!> <div class="mt-4 flex space-x-6 sm:justify-center md:mt-0 rtl:space-x-reverse"><!> <!> <!> <!> <!></div></div>`, 1);

export default function Sitemap($$anchor) {
	Footer($$anchor, {
		footerType: 'sitemap',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var div = $.first_child(fragment_1);
			var div_1 = $.child(div);
			var node = $.sibling($.child(div_1), 2);

			FooterLinkGroup(node, {
				class: 'text-gray-900 dark:text-gray-200',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					FooterLink(node_1, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('About');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					FooterLink(node_2, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Careers');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					FooterLink(node_3, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Brand Center');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					FooterLink(node_4, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Blog');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_5 = $.sibling($.child(div_2), 2);

			FooterLinkGroup(node_5, {
				class: 'text-gray-900 dark:text-gray-200',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_6 = $.first_child(fragment_3);

					FooterLink(node_6, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Discord Server');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					FooterLink(node_7, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Twitter');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					FooterLink(node_8, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Facebook');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					FooterLink(node_9, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Contact Us');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_10 = $.sibling($.child(div_3), 2);

			FooterLinkGroup(node_10, {
				class: 'text-gray-900 dark:text-gray-200',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_11 = $.first_child(fragment_4);

					FooterLink(node_11, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Privacy Policy');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					FooterLink(node_12, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Licensing');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					FooterLink(node_13, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Terms & Conditions');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_14 = $.sibling($.child(div_4), 2);

			FooterLinkGroup(node_14, {
				class: 'text-gray-900 dark:text-gray-200',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_15 = $.first_child(fragment_5);

					FooterLink(node_15, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('iOS');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					FooterLink(node_16, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('Android');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					FooterLink(node_17, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Windows');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					FooterLink(node_18, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('MacOS');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.reset(div);

			var div_5 = $.sibling(div, 2);
			var node_19 = $.child(div_5);

			FooterCopyright(node_19, {
				class: 'text-sm text-gray-900 sm:text-center dark:text-gray-200',
				href: '/',
				by: 'Flowbite™'
			});

			var div_6 = $.sibling(node_19, 2);
			var node_20 = $.child(div_6);

			FooterIcon(node_20, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					FacebookSolid($$anchor, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			var node_21 = $.sibling(node_20, 2);

			FooterIcon(node_21, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					DiscordSolid($$anchor, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			FooterIcon(node_22, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					TwitterSolid($$anchor, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			var node_23 = $.sibling(node_22, 2);

			FooterIcon(node_23, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					GithubSolid($$anchor, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			var node_24 = $.sibling(node_23, 2);

			FooterIcon(node_24, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					Dribble($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.reset(div_6);
			$.reset(div_5);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}