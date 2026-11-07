import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Button } from "flowbite-svelte";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="flex md:order-2"><!> <!></div> <!>`, 1);

export default function Cta($$anchor) {
	Navbar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			NavBrand(node, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var node_1 = $.child(div);

			Button(node_1, {
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Get started');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			NavHamburger(node_2, {});
			$.reset(div);

			var node_3 = $.sibling(div, 2);

			NavUl(node_3, {
				class: 'order-1',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_4 = $.first_child(fragment_3);

					NavLi(node_4, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Home');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					NavLi(node_5, {
						href: '/about',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('About');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					NavLi(node_6, {
						href: '/docs/components/navbar',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Navbar');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					NavLi(node_7, {
						href: '/pricing',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Pricing');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					NavLi(node_8, {
						href: '/contact',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Contact');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}