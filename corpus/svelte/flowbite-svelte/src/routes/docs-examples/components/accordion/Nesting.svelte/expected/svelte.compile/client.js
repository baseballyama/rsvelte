import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, Accordion } from "flowbite-svelte";

var root = $.from_html(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p> <p class="text-gray-500 dark:text-gray-400">Check out this guide to learn how to <a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">get started</a> and start developing websites even faster with components on top of Tailwind CSS.</p>`, 1);
var root_1 = $.from_html(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p> <p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p> <p class="mb-2 text-gray-500 dark:text-gray-400">Learn more about these technologies:</p> <ul class="list-disc ps-5 text-gray-500 dark:text-gray-400"><li><a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">Lorem ipsum</a></li> <li><a href="https://tailwindui.com/" rel="noreferrer" target="_blank" class="text-blue-600 hover:underline dark:text-blue-500">Tailwind UI</a></li></ul>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Nesting($$anchor) {
	Accordion($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			{
				const header = ($$anchor) => {
					$.next();

					var text = $.text('My Header 1');

					$.append($$anchor, text);
				};

				AccordionItem(node, {
					open: true,
					header,
					children: ($$anchor, $$slotProps) => {
						Accordion($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_2();
								var node_1 = $.first_child(fragment_3);

								{
									const header = ($$anchor) => {
										$.next();

										var text_1 = $.text('My Header 1');

										$.append($$anchor, text_1);
									};

									AccordionItem(node_1, {
										header,
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();

											$.next(2);
											$.append($$anchor, fragment_4);
										},
										$$slots: { header: true, default: true }
									});
								}

								var node_2 = $.sibling(node_1, 2);

								{
									const header = ($$anchor) => {
										$.next();

										var text_2 = $.text('My Header 2');

										$.append($$anchor, text_2);
									};

									AccordionItem(node_2, {
										header,
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_1();

											$.next(6);
											$.append($$anchor, fragment_5);
										},
										$$slots: { header: true, default: true }
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { header: true, default: true }
				});
			}

			var node_3 = $.sibling(node, 2);

			{
				const header = ($$anchor) => {
					$.next();

					var text_3 = $.text('My Header 2');

					$.append($$anchor, text_3);
				};

				AccordionItem(node_3, {
					header,
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_1();

						$.next(6);
						$.append($$anchor, fragment_6);
					},
					$$slots: { header: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}