import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion, AccordionItem } from "carbon-components-svelte";

var root = $.from_html(`<p>Nested content</p>`);

export default function AccordionNestedFixture($$anchor) {
	Accordion($$anchor, {
		'data-testid': 'accordion-outer',
		children: ($$anchor, $$slotProps) => {
			AccordionItem($$anchor, {
				title: 'Outer',
				'data-testid': 'accordion-item-outer',
				children: ($$anchor, $$slotProps) => {
					Accordion($$anchor, {
						'data-testid': 'accordion-inner',
						children: ($$anchor, $$slotProps) => {
							AccordionItem($$anchor, {
								title: 'Inner',
								'data-testid': 'accordion-item-inner',
								children: ($$anchor, $$slotProps) => {
									var p = root();

									$.append($$anchor, p);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}