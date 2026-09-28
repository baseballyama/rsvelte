import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Navbar,
	NavBrand,
	NavLi,
	NavUl,
	NavHamburger,
	Avatar,
	Dropdown,
	DropdownItem,
	DropdownHeader,
	DropdownGroup
} from "flowbite-svelte";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`, 1);
var root_1 = $.from_html(`<span class="block text-sm">Bonnie Green</span> <span class="block truncate text-sm font-medium">name@flowbite.com</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <div class="flex items-center md:order-2"><!> <!></div> <!> <!>`, 1);

export default function User($$anchor) {
	Navbar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
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

			Avatar(node_1, { id: 'avatar-menu', src: '/images/profile-picture-3.webp' });

			var node_2 = $.sibling(node_1, 2);

			NavHamburger(node_2, {});
			$.reset(div);

			var node_3 = $.sibling(div, 2);

			Dropdown(node_3, {
				placement: 'bottom',
				triggeredBy: '#avatar-menu',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_4 = $.first_child(fragment_3);

					DropdownHeader(node_4, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();

							$.next(2);
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					DropdownGroup(node_5, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_6 = $.first_child(fragment_5);

							DropdownItem(node_6, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Dashboard');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							DropdownItem(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Settings');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							DropdownItem(node_8, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Earnings');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_5, 2);

					DropdownHeader(node_9, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Sign out');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_3, 2);

			NavUl(node_10, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_3();
					var node_11 = $.first_child(fragment_6);

					NavLi(node_11, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Home');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					NavLi(node_12, {
						href: '/about',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('About');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					NavLi(node_13, {
						href: '/docs/components/navbar',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Navbar');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					NavLi(node_14, {
						href: '/pricing',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Pricing');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					NavLi(node_15, {
						href: '/contact',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Contact');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}