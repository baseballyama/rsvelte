import * as $ from 'svelte/internal/server';
import { Accordion, AccordionItem } from "carbon-components-svelte";

export default function AccordionNestedFixture($$renderer) {
	Accordion($$renderer, {
		'data-testid': 'accordion-outer',
		children: ($$renderer) => {
			AccordionItem($$renderer, {
				title: 'Outer',
				'data-testid': 'accordion-item-outer',
				children: ($$renderer) => {
					Accordion($$renderer, {
						'data-testid': 'accordion-inner',
						children: ($$renderer) => {
							AccordionItem($$renderer, {
								title: 'Inner',
								'data-testid': 'accordion-item-inner',
								children: ($$renderer) => {
									$$renderer.push(`<p>Nested content</p>`);
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