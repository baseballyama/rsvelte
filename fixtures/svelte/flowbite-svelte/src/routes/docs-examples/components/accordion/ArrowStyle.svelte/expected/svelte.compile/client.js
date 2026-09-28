import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, Accordion } from "flowbite-svelte";
import { ChevronDoubleUpOutline, ChevronDoubleDownOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ArrowStyle($$anchor) {
	Accordion($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				const header = ($$anchor) => {
					$.next();

					var text = $.text('Header 2-1');

					$.append($$anchor, text);
				};

				const arrowup = ($$anchor) => {
					ChevronDoubleUpOutline($$anchor, { class: '-me-0.5 h-6 w-6' });
				};

				const arrowdown = ($$anchor) => {
					ChevronDoubleDownOutline($$anchor, { class: '-me-0.5 h-6 w-6' });
				};

				AccordionItem(node, {
					header,
					arrowup,
					arrowdown,
					children: ($$anchor, $$slotProps) => {
						var p = root();

						$.append($$anchor, p);
					},
					$$slots: { header: true, arrowup: true, arrowdown: true, default: true }
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				const header = ($$anchor) => {
					$.next();

					var text_1 = $.text('Header 2-2');

					$.append($$anchor, text_1);
				};

				const arrowup = ($$anchor) => {
					ChevronDoubleUpOutline($$anchor, { class: '-me-0.5 h-6 w-6' });
				};

				const arrowdown = ($$anchor) => {
					ChevronDoubleDownOutline($$anchor, { class: '-me-0.5 h-6 w-6' });
				};

				AccordionItem(node_1, {
					header,
					arrowup,
					arrowdown,
					children: ($$anchor, $$slotProps) => {
						var p_1 = root();

						$.append($$anchor, p_1);
					},
					$$slots: { header: true, arrowup: true, arrowdown: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}