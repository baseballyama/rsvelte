import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Navbar,
	NavBrand,
	NavLi,
	NavUl,
	NavHamburger,
	ImagePlaceholder,
	Skeleton,
	TextPlaceholder
} from "flowbite-svelte";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="relative px-8"><!> <div style="height:300px;" class="overflow-scroll pb-16"><!> <!> <!></div></div>`);

export default function Sticky($$anchor) {
	var div = root_3();
	var node = $.child(div);

	Navbar(node, {
		class: 'sticky start-0 top-0 z-20 w-full bg-white px-2 py-2.5 sm:px-4 dark:bg-gray-800',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			NavBrand(node_1, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();

					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			NavHamburger(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			NavUl(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_4 = $.first_child(fragment_2);

					NavLi(node_4, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Home');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					NavLi(node_5, {
						href: '/about',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('About');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					NavLi(node_6, {
						href: '/docs/components/navbar',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Navbar');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					NavLi(node_7, {
						href: '/pricing',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Pricing');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					NavLi(node_8, {
						href: '/contact',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Contact');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_9 = $.child(div_1);

	Skeleton(node_9, { class: 'mt-4 mb-8' });

	var node_10 = $.sibling(node_9, 2);

	ImagePlaceholder(node_10, { class: 'my-8' });

	var node_11 = $.sibling(node_10, 2);

	TextPlaceholder(node_11, { class: 'my-8' });
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}