import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Navbar,
	NavBrand,
	NavLi,
	NavUl,
	NavHamburger,
	Search,
	ToolbarButton
} from "flowbite-svelte";

import { SearchOutline } from "flowbite-svelte-icons";
import { fade } from "svelte/transition";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`, 1);
var root_1 = $.from_html(`<div class="mt-2 w-full md:hidden"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="flex md:order-2"><!> <div class="hidden md:block"><!></div> <!></div> <!> <!>`, 1);

export default function Search_1($$anchor) {
	{
		const children = ($$anchor, $$arg0) => {
			let hidden = () => ($$arg0?.()).hidden;
			let toggle = () => ($$arg0?.()).toggle;
			var fragment_1 = root_3();
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

			ToolbarButton(node_1, {
				class: 'block md:hidden',
				get onclick() {
					return toggle();
				},

				children: ($$anchor, $$slotProps) => {
					SearchOutline($$anchor, { class: 'h-5 w-5 text-gray-500 dark:text-gray-400' });
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_1, 2);
			var node_2 = $.child(div_1);

			Search(node_2, { size: 'md', class: 'ms-auto', placeholder: 'Search...' });
			$.reset(div_1);

			var node_3 = $.sibling(div_1, 2);

			NavHamburger(node_3, {});
			$.reset(div);

			var node_4 = $.sibling(div, 2);

			{
				var consequent = ($$anchor) => {
					var div_2 = root_1();
					var node_5 = $.child(div_2);

					Search(node_5, { size: 'md', placeholder: 'Search...' });
					$.reset(div_2);
					$.transition(3, div_2, () => fade);
					$.append($$anchor, div_2);
				};

				$.if(node_4, ($$render) => {
					if (!hidden()) $$render(consequent);
				});
			}

			var node_6 = $.sibling(node_4, 2);

			NavUl(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_7 = $.first_child(fragment_4);

					NavLi(node_7, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Home');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					NavLi(node_8, {
						href: '/about',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('About');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					NavLi(node_9, {
						href: '/docs/components/navbar',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Navbar');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		Navbar($$anchor, { children, $$slots: { default: true } });
	}
}