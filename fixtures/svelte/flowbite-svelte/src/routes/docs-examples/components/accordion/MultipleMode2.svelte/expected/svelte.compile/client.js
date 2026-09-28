import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, Accordion, Button, P } from "flowbite-svelte";

var root = $.from_html(`Check out this guide to learn how to <a href="/" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline dark:text-blue-500">get started</a> and start developing websites even faster with components on top of Tailwind CSS.`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function MultipleMode2($$anchor) {
	const items = $.proxy([false, false, false]);
	const open_all = () => items.forEach((_, i) => items[i] = true);
	const close_all = () => items.forEach((_, i) => items[i] = false);
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: open_all,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open all');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: close_all,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Close all');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Accordion(node_2, {
		multiple: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_3 = $.first_child(fragment_1);

			{
				const header = ($$anchor) => {
					$.next();

					var text_2 = $.text('My Header 1');

					$.append($$anchor, text_2);
				};

				AccordionItem(node_3, {
					get open() {
						return items[0];
					},

					set open($$value) {
						items[0] = $$value;
					},
					header,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_4 = $.first_child(fragment_2);

						P(node_4, {
							class: 'mb-2',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_4, 2);

						P(node_5, {
							class: 'text-gray-500 dark:text-gray-400',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_3 = root();

								$.next(2);
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { header: true, default: true }
				});
			}

			var node_6 = $.sibling(node_3, 2);

			{
				const header = ($$anchor) => {
					$.next();

					var text_4 = $.text('My Header 2');

					$.append($$anchor, text_4);
				};

				AccordionItem(node_6, {
					get open() {
						return items[1];
					},

					set open($$value) {
						items[1] = $$value;
					},
					header,
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_2();
						var node_7 = $.first_child(fragment_4);

						P(node_7, {
							class: 'mb-2',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_7, 2);

						P(node_8, {
							class: 'mb-2',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});

						var node_9 = $.sibling(node_8, 2);

						P(node_9, {
							class: 'mb-2',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Learn more about these technologies:');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { header: true, default: true }
				});
			}

			var node_10 = $.sibling(node_6, 2);

			{
				const header = ($$anchor) => {
					$.next();

					var text_8 = $.text('My Header 3');

					$.append($$anchor, text_8);
				};

				AccordionItem(node_10, {
					get open() {
						return items[2];
					},

					set open($$value) {
						items[2] = $$value;
					},
					header,
					children: ($$anchor, $$slotProps) => {
						P($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_9 = $.text('Something more');

								$.append($$anchor, text_9);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { header: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}