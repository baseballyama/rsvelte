import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Footer,
	FooterCopyright,
	FooterLinkGroup,
	FooterBrand,
	FooterLink
} from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="sm:flex sm:items-center sm:justify-between"><!> <!></div> <hr class="my-6 border-gray-200 sm:mx-auto lg:my-8 dark:border-gray-700"/> <!>`, 1);

export default function Logo($$anchor) {
	Footer($$anchor, {
		footerType: 'logo',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			FooterBrand(node, {
				href: 'https://flowbite.com',
				src: '/images/flowbite-svelte-icon-logo.svg',
				alt: 'Flowbite Logo',
				name: 'Flowbite'
			});

			var node_1 = $.sibling(node, 2);

			FooterLinkGroup(node_1, {
				class: 'mb-6 flex flex-wrap items-center text-sm text-gray-500 sm:mb-0 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					FooterLink(node_2, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('About');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					FooterLink(node_3, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Privacy Policy');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					FooterLink(node_4, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Licensing');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					FooterLink(node_5, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Contact');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var node_6 = $.sibling(div, 4);

			FooterCopyright(node_6, { href: '/', by: 'Flowbite™' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}