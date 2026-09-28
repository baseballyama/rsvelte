import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Navbar, NavBrand, NavHamburger, NavUl, NavLi, MegaMenu } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`, 1);
var root_1 = $.from_html(`Mega menu<!>`, 1);
var root_2 = $.from_html(`<a href="/" class="block h-full rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700"><div class="font-semibold dark:text-white"> </div> <span class="text-sm font-light text-gray-500 dark:text-gray-400"> </span></a>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Dropdown($$anchor) {
	let menu2 = [
		{
			name: "Online Stores",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Segmentation",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Marketing CRM",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Online Stores",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Segmentation",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Marketing CRM",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Audience Management",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Creative Tools",
			help: "Connect with third-party tools that you're already using."
		},

		{
			name: "Marketing Automation",
			help: "Connect with third-party tools that you're already using."
		}
	];

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

					{
						const children = ($$anchor, $$arg0) => {
							let item = () => ($$arg0?.()).item;
							var a = root_2();
							var div = $.child(a);
							var text_1 = $.only_child(div, true);
							var span = $.sibling(div, 2);
							var text_2 = $.only_child(span, true);

							$.reset(a);

							$.template_effect(() => {
								$.set_text(text_1, item().name);
								$.set_text(text_2, item().help);
							});

							$.append($$anchor, a);
						};

						MegaMenu(node_6, {
							full: true,
							get items() {
								return menu2;
							},
							children,
							$$slots: { default: true }
						});
					}

					var node_7 = $.sibling(node_6, 2);

					NavLi(node_7, {
						href: '/services',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Services');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					NavLi(node_8, {
						href: '/services',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Products');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					NavLi(node_9, {
						href: '/services',
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