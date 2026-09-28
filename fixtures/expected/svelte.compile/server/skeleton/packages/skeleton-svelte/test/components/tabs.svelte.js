import * as $ from 'svelte/internal/server';
import { Tabs } from '../../src/index.js';

export default function Tabs_1($$renderer) {
	Tabs($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Tabs.List) {
				$$renderer.push('<!--[-->');

				Tabs.List($$renderer, {
					'data-testid': 'list',
					children: ($$renderer) => {
						if (Tabs.Trigger) {
							$$renderer.push('<!--[-->');
							Tabs.Trigger($$renderer, { value: 'tab', 'data-testid': 'trigger' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tabs.Indicator) {
							$$renderer.push('<!--[-->');
							Tabs.Indicator($$renderer, { 'data-testid': 'indicator' });
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

			if (Tabs.Content) {
				$$renderer.push('<!--[-->');
				Tabs.Content($$renderer, { value: 'tab', 'data-testid': 'content' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}