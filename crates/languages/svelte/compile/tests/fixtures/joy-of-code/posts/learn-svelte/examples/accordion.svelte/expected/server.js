import * as $ from 'svelte/internal/server';
import { Accordion, AccordionItem } from './accordion/index';

export default function Accordion_1($$renderer) {
	$$renderer.push(`<div class="container svelte-1rjire7">`);

	Accordion($$renderer, {
		children: ($$renderer) => {
			AccordionItem($$renderer, {
				title: 'Item A',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Content A`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			AccordionItem($$renderer, {
				title: 'Item B',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Content A`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			AccordionItem($$renderer, {
				title: 'Item C',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Content A`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			AccordionItem($$renderer, {
				title: 'Item D',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Content A`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}