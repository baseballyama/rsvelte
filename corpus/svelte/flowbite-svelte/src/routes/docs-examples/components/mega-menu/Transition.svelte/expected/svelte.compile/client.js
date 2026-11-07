import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Navbar, NavBrand, NavHamburger, NavUl, NavLi, MegaMenu } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";
import { blur, slide, scale } from "svelte/transition";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`, 1);
var root_1 = $.from_html(`Slide<!>`, 1);
var root_2 = $.from_html(`<a class="hover:text-primary-600 dark:hover:text-primary-500"> </a>`);
var root_3 = $.from_html(`Blur<!>`, 1);
var root_4 = $.from_html(`Scale<!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function Transition($$anchor) {
	let menu = [
		{ name: "About us", href: "/about" },
		{ name: "Blog", href: "/blog" },
		{ name: "Contact us", href: "/contact" },
		{ name: "Library", href: "/library" },
		{ name: "Newsletter", href: "/news" },
		{ name: "Support Center", href: "/support" },
		{ name: "Resources", href: "/resource" },
		{ name: "Playground", href: "/play" },
		{ name: "Terms", href: "/terms" },
		{ name: "Pro Version", href: "/pro" },
		{ name: "License", href: "/license" }
	];

	Navbar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
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
					var fragment_3 = root_5();
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

						MegaMenu(node_6, {
							get items() {
								return menu;
							},

							get transition() {
								return slide;
							},
							transitionParams: { duration: 1000 },
							children,
							$$slots: { default: true }
						});
					}

					var node_7 = $.sibling(node_6, 2);

					NavLi(node_7, {
						class: 'cursor-pointer',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_5 = root_3();
							var node_8 = $.sibling($.first_child(fragment_5));

							ChevronDownOutline(node_8, {
								class: 'text-primary-800 ms-2 inline h-6 w-6 dark:text-white'
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_7, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let item = () => ($$arg0?.()).item;
							var a_1 = root_2();
							var text_2 = $.only_child(a_1, true);

							$.template_effect(() => {
								$.set_attribute(a_1, 'href', item().href);
								$.set_text(text_2, item().name);
							});

							$.append($$anchor, a_1);
						};

						MegaMenu(node_9, {
							get items() {
								return menu;
							},

							get transition() {
								return blur;
							},
							transitionParams: { duration: 1000 },
							children,
							$$slots: { default: true }
						});
					}

					var node_10 = $.sibling(node_9, 2);

					NavLi(node_10, {
						class: 'cursor-pointer',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_6 = root_4();
							var node_11 = $.sibling($.first_child(fragment_6));

							ChevronDownOutline(node_11, {
								class: 'text-primary-800 ms-2 inline h-6 w-6 dark:text-white'
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_10, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let item = () => ($$arg0?.()).item;
							var a_2 = root_2();
							var text_3 = $.only_child(a_2, true);

							$.template_effect(() => {
								$.set_attribute(a_2, 'href', item().href);
								$.set_text(text_3, item().name);
							});

							$.append($$anchor, a_2);
						};

						MegaMenu(node_12, {
							get items() {
								return menu;
							},

							get transition() {
								return scale;
							},
							transitionParams: { duration: 1000 },
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}