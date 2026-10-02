import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion, AccordionItem } from "carbon-components-svelte";

var root = $.from_html(`<p>Content for section 1</p>`);
var root_1 = $.from_html(`<p>Content for section 2</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function AccordionFixture($$anchor) {
	Accordion($$anchor, {
		'data-testid': 'accordion',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			AccordionItem(node, {
				title: 'Section 1',
				'data-testid': 'accordion-item-1',
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			AccordionItem(node_1, {
				title: 'Section 2',
				'data-testid': 'accordion-item-2',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_1();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}