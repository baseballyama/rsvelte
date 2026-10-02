import * as $ from 'svelte/internal/server';
import { Accordion, AccordionItem } from "carbon-components-svelte";

export default function AccordionFixture($$renderer) {
	Accordion($$renderer, {
		'data-testid': 'accordion',
		children: ($$renderer) => {
			AccordionItem($$renderer, {
				title: 'Section 1',
				'data-testid': 'accordion-item-1',
				children: ($$renderer) => {
					$$renderer.push(`<p>Content for section 1</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			AccordionItem($$renderer, {
				title: 'Section 2',
				'data-testid': 'accordion-item-2',
				children: ($$renderer) => {
					$$renderer.push(`<p>Content for section 2</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}