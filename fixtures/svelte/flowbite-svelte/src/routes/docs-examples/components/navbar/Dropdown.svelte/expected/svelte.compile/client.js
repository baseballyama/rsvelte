import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Navbar,
	NavBrand,
	NavLi,
	NavUl,
	NavHamburger,
	Dropdown,
	DropdownItem,
	DropdownDivider
} from "flowbite-svelte";

import { ChevronDownOutline } from "flowbite-svelte-icons";
import { page } from "$app/state";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`, 1);
var root_1 = $.from_html(`Dropdown<!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Dropdown_1($$anchor, $$props) {
	$.push($$props, true);

	let activeUrl = $.derived(() => page.url.pathname);

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

			var node_1 = $.sibling(node, 2);

			NavHamburger(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			NavUl(node_2, {
				get activeUrl() {
					return $.get(activeUrl);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_3();
					var node_3 = $.first_child(fragment_3);

					NavLi(node_3, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Home');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					NavLi(node_4, {
						class: 'cursor-pointer',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_4 = root_1();
							var node_5 = $.sibling($.first_child(fragment_4));

							ChevronDownOutline(node_5, {
								class: 'text-primary-800 ms-2 inline h-6 w-6 dark:text-white'
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_4, 2);

					Dropdown(node_6, {
						simple: true,
						class: 'w-44',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_7 = $.first_child(fragment_5);

							DropdownItem(node_7, {
								href: '/',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Dashboard');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							DropdownItem(node_8, {
								href: '/docs/components/navbar',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Settings');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							DropdownItem(node_9, {
								href: '/',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Earnings');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							DropdownDivider(node_10, {});

							var node_11 = $.sibling(node_10, 2);

							DropdownItem(node_11, {
								href: '/',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Sign out');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_6, 2);

					NavLi(node_12, {
						href: '/settings',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Setting');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					NavLi(node_13, {
						href: '/pricing',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Pricing');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_13, 2);

					NavLi(node_14, {
						href: '/contact',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Contact');

							$.append($$anchor, text_7);
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

	$.pop();
}