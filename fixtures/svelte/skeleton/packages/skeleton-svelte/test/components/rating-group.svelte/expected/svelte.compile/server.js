import * as $ from 'svelte/internal/server';
import { RatingGroup } from '../../src/index.js';

export default function Rating_group($$renderer) {
	RatingGroup($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (RatingGroup.Label) {
				$$renderer.push('<!--[-->');

				RatingGroup.Label($$renderer, {
					'data-testid': 'label',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (RatingGroup.Control) {
				$$renderer.push('<!--[-->');

				RatingGroup.Control($$renderer, {
					'data-testid': 'control',
					children: ($$renderer) => {
						if (RatingGroup.Item) {
							$$renderer.push('<!--[-->');
							RatingGroup.Item($$renderer, { index: 1, 'data-testid': 'item' });
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

			if (RatingGroup.HiddenInput) {
				$$renderer.push('<!--[-->');
				RatingGroup.HiddenInput($$renderer, { 'data-testid': 'hidden-input' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}