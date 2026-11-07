import * as $ from 'svelte/internal/server';
import { Switch } from '../../src/index.js';

export default function Switch_1($$renderer) {
	Switch($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Switch.HiddenInput) {
				$$renderer.push('<!--[-->');
				Switch.HiddenInput($$renderer, { 'data-testid': 'hidden-input' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Switch.Control) {
				$$renderer.push('<!--[-->');

				Switch.Control($$renderer, {
					'data-testid': 'control',
					children: ($$renderer) => {
						if (Switch.Thumb) {
							$$renderer.push('<!--[-->');
							Switch.Thumb($$renderer, { 'data-testid': 'thumb' });
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

			if (Switch.Label) {
				$$renderer.push('<!--[-->');
				Switch.Label($$renderer, { 'data-testid': 'label' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}