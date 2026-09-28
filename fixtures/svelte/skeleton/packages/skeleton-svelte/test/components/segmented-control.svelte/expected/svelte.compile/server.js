import * as $ from 'svelte/internal/server';
import { SegmentedControl } from '../../src/index.js';

export default function Segmented_control($$renderer) {
	SegmentedControl($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (SegmentedControl.Label) {
				$$renderer.push('<!--[-->');
				SegmentedControl.Label($$renderer, { 'data-testid': 'label' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (SegmentedControl.Control) {
				$$renderer.push('<!--[-->');

				SegmentedControl.Control($$renderer, {
					'data-testid': 'control',
					children: ($$renderer) => {
						if (SegmentedControl.Indicator) {
							$$renderer.push('<!--[-->');
							SegmentedControl.Indicator($$renderer, { 'data-testid': 'indicator' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (SegmentedControl.Item) {
							$$renderer.push('<!--[-->');

							SegmentedControl.Item($$renderer, {
								value: 'item-1',
								'data-testid': 'item',
								children: ($$renderer) => {
									if (SegmentedControl.ItemText) {
										$$renderer.push('<!--[-->');
										SegmentedControl.ItemText($$renderer, { 'data-testid': 'item-text' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (SegmentedControl.ItemHiddenInput) {
										$$renderer.push('<!--[-->');
										SegmentedControl.ItemHiddenInput($$renderer, { 'data-testid': 'item-hidden-input' });
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}