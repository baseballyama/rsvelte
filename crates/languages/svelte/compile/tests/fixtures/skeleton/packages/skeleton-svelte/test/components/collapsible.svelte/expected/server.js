import * as $ from 'svelte/internal/server';
import { Collapsible } from '../../src/index.js';

export default function Collapsible_1($$renderer) {
	Collapsible($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Collapsible.Trigger) {
				$$renderer.push('<!--[-->');

				Collapsible.Trigger($$renderer, {
					'data-testid': 'trigger',
					children: ($$renderer) => {
						if (Collapsible.Indicator) {
							$$renderer.push('<!--[-->');
							Collapsible.Indicator($$renderer, { 'data-testid': 'indicator' });
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

			if (Collapsible.Content) {
				$$renderer.push('<!--[-->');
				Collapsible.Content($$renderer, { 'data-testid': 'content' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}