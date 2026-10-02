import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion, AccordionItem } from './accordion/index';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="container svelte-1rjire7"><!></div>`);

export default function Accordion_1($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Accordion(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			AccordionItem(node_1, {
				title: 'Item A',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Content A');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			AccordionItem(node_2, {
				title: 'Item B',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Content A');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			AccordionItem(node_3, {
				title: 'Item C',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Content A');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			AccordionItem(node_4, {
				title: 'Item D',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Content A');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}