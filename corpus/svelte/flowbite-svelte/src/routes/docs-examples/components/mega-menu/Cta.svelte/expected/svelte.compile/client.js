import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Navbar, NavBrand, NavHamburger, NavUl, NavLi, MegaMenu } from "flowbite-svelte";
import { ChevronDownOutline, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`, 1);
var root_1 = $.from_html(`Company<!>`, 1);
var root_2 = $.from_html(`<a class="hover:text-primary-600 dark:hover:text-primary-500 hover:underline"> </a>`);
var root_3 = $.from_html(`<h2 class="mt-4 mb-2 font-semibold text-gray-900 dark:text-white">Our brands</h2> <p class="mb-2 p-0 text-sm font-light text-gray-500 dark:text-gray-300">At Flowbite, we have a portfolio of brands that cater to a variety of preferences.</p> <a href="/" class="text-primary-600 hover:text-primary-600 dark:text-primary-500 dark:hover:text-primary-700 inline-flex items-center text-sm font-medium hover:underline">Explore our brands <span class="sr-only">Explore our brands</span> <!></a>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);

export default function Cta($$anchor) {
	let menu = [
		{ name: "About us", href: "/about" },
		{ name: "Blog", href: "/blog" },
		{ name: "Contact us", href: "/contact" },
		{ name: "Library", href: "/library" },
		{ name: "Newsletter", href: "/news" },
		{ name: "Support Center", href: "/support" },
		{ name: "Resources", href: "/resource" },
		{ name: "Playground", href: "/play" },
		{ name: "Terms", href: "/tersm" },
		{ name: "Pro Version", href: "/pro" },
		{ name: "License", href: "/license" }
	];

	Navbar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
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
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_4();
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

					{
						const children = ($$anchor, $$arg0) => {
							let item = () => ($$arg0?.()).item;
							var a = root_2();
							var text_1 = $.only_child(a, true);

							$.template_effect(() => {
								$.set_attribute(a, 'href', item().href);
								$.set_text(text_1, item().name);
							});

							$.append($$anchor, a);
						};

						const extra = ($$anchor) => {
							var fragment_5 = root_3();
							var a_1 = $.sibling($.first_child(fragment_5), 4);
							var node_7 = $.sibling($.child(a_1), 3);

							ArrowRightOutline(node_7, {
								class: 'text-primary-600 hover:text-primary-600 dark:text-primary-500 dark:hover:text-primary-700  ms-2 h-6 w-6'
							});

							$.reset(a_1);
							$.append($$anchor, fragment_5);
						};

						MegaMenu(node_6, {
							full: true,
							get items() {
								return menu;
							},
							children,
							extra,
							$$slots: { default: true, extra: true }
						});
					}

					var node_8 = $.sibling(node_6, 2);

					NavLi(node_8, {
						href: '/services',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Marketplace');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					NavLi(node_9, {
						href: '/services',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Resources');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					NavLi(node_10, {
						href: '/services',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Contact');

							$.append($$anchor, text_4);
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