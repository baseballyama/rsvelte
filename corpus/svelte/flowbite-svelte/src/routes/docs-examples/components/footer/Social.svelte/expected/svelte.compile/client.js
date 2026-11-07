import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="md:flex md:justify-between"><div class="mb-6 md:mb-0"><!></div> <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6"><div><h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Resources</h2> <!></div> <div><h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Follow us</h2> <!></div> <div><h2 class="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Legal</h2> <!></div></div></div> <hr class="my-6 border-gray-200 sm:mx-auto lg:my-8 dark:border-gray-700"/> <div class="sm:flex sm:items-center sm:justify-between"><!> <div class="mt-4 flex space-x-6 sm:mt-0 sm:justify-center rtl:space-x-reverse"><!> <!> <!> <!> <!></div></div>`, 1);

export default function Social($$anchor) {
	Footer($$anchor, {
		footerType: 'socialmedia',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var div_1 = $.child(div);
			var node = $.child(div_1);

			FooterBrand(node, {
				href: 'https://flowbite.com',
				src: '/images/flowbite-svelte-icon-logo.svg',
				alt: 'Flowbite Logo',
				name: 'Flowbite'
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var div_3 = $.child(div_2);
			var node_1 = $.sibling($.child(div_3), 2);

			FooterLinkGroup(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					FooterLink(node_2, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Flowbite');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					FooterLink(node_3, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Tailwind CSS');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_4 = $.sibling($.child(div_4), 2);

			FooterLinkGroup(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					FooterLink(node_5, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('GitHub');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					FooterLink(node_6, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Discord');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_7 = $.sibling($.child(div_5), 2);

			FooterLinkGroup(node_7, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_8 = $.first_child(fragment_4);

					FooterLink(node_8, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Privacy Policy');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					FooterLink(node_9, {
						class: 'mb-4',
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Terms & Conditions');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.reset(div_2);
			$.reset(div);

			var div_6 = $.sibling(div, 4);
			var node_10 = $.child(div_6);

			FooterCopyright(node_10, { href: '/', by: 'Flowbite™' });

			var div_7 = $.sibling(node_10, 2);
			var node_11 = $.child(div_7);

			FooterIcon(node_11, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					FacebookSolid($$anchor, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			FooterIcon(node_12, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					DiscordSolid($$anchor, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			FooterIcon(node_13, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					TwitterSolid($$anchor, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			FooterIcon(node_14, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					GithubSolid($$anchor, {
						class: 'h-5 w-5 text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white'
					});
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			FooterIcon(node_15, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					Dribble($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.reset(div_7);
			$.reset(div_6);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}