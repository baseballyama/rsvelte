import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, Accordion } from "flowbite-svelte";
import { CartSolid, CogOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="flex items-center gap-2"><!> <span>My Header 1</span></div>`);
var root_1 = $.from_html(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo...</p> <p class="text-gray-500 dark:text-gray-400">Check out this guide to learn how to <a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">get started</a> and start websites even faster with components on top of Tailwind CSS.</p>`, 1);
var root_2 = $.from_html(`<div class="flex items-center gap-2"><!> <span>My Header 2</span></div>`);
var root_3 = $.from_html(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sintexplicabo...</p>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Icon($$anchor) {
	Accordion($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			{
				const header = ($$anchor) => {
					var div = root();
					var node_1 = $.child(div);

					CartSolid(node_1, {});
					$.next(2);
					$.reset(div);
					$.append($$anchor, div);
				};

				AccordionItem(node, {
					header,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();

						$.next(2);
						$.append($$anchor, fragment_2);
					},
					$$slots: { header: true, default: true }
				});
			}

			var node_2 = $.sibling(node, 2);

			{
				const header = ($$anchor) => {
					var div_1 = root_2();
					var node_3 = $.child(div_1);

					CogOutline(node_3, {});
					$.next(2);
					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				AccordionItem(node_2, {
					header,
					children: ($$anchor, $$slotProps) => {
						var p = root_3();

						$.append($$anchor, p);
					},
					$$slots: { header: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}