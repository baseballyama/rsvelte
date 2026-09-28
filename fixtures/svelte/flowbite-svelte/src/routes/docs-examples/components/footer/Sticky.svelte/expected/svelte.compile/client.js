import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Footer,
	FooterLinkGroup,
	FooterLink,
	ImagePlaceholder,
	TextPlaceholder,
	Skeleton,
	FooterCopyright
} from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div style="height:300px;" class="overflow-scroll pb-16"><!> <!> <!></div> <!>`, 1);

export default function Sticky($$anchor) {
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Skeleton(node, { class: 'my-8' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'my-8' });

	var node_2 = $.sibling(node_1, 2);

	TextPlaceholder(node_2, { class: 'my-8' });
	$.reset(div);

	var node_3 = $.sibling(div, 2);

	Footer(node_3, {
		class: 'absolute start-0 bottom-0 z-20 w-full border-t border-gray-200 bg-white p-4 shadow-sm md:flex md:items-center md:justify-between md:p-6 dark:border-gray-600 dark:bg-gray-800',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_4 = $.first_child(fragment_1);

			FooterCopyright(node_4, { href: '/', by: 'Flowbite™', year: 2022 });

			var node_5 = $.sibling(node_4, 2);

			FooterLinkGroup(node_5, {
				class: 'mt-3 flex flex-wrap items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_6 = $.first_child(fragment_2);

					FooterLink(node_6, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('About');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					FooterLink(node_7, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Privacy Policy');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					FooterLink(node_8, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Licensing');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					FooterLink(node_9, {
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}