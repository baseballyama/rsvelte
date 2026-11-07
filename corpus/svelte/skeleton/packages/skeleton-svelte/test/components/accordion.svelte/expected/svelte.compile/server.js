import * as $ from 'svelte/internal/server';
import { Accordion } from '../../src/index.js';

export default function Accordion_1($$renderer) {
	Accordion($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Accordion.Item) {
				$$renderer.push('<!--[-->');

				Accordion.Item($$renderer, {
					value: 'item',
					'data-testid': 'item',
					children: ($$renderer) => {
						if (Accordion.ItemTrigger) {
							$$renderer.push('<!--[-->');

							Accordion.ItemTrigger($$renderer, {
								'data-testid': 'item-trigger',
								children: ($$renderer) => {
									if (Accordion.ItemIndicator) {
										$$renderer.push('<!--[-->');
										Accordion.ItemIndicator($$renderer, { 'data-testid': 'item-indicator' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Accordion.ItemContent) {
							$$renderer.push('<!--[-->');
							Accordion.ItemContent($$renderer, { 'data-testid': 'item-content' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}