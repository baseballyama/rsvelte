import * as $ from 'svelte/internal/server';
import { Tooltip } from '../../src/index.js';

export default function Tooltip_1($$renderer) {
	Tooltip($$renderer, {
		children: ($$renderer) => {
			if (Tooltip.Trigger) {
				$$renderer.push('<!--[-->');
				Tooltip.Trigger($$renderer, { 'data-testid': 'trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Tooltip.Positioner) {
				$$renderer.push('<!--[-->');

				Tooltip.Positioner($$renderer, {
					'data-testid': 'positioner',
					children: ($$renderer) => {
						if (Tooltip.Content) {
							$$renderer.push('<!--[-->');

							Tooltip.Content($$renderer, {
								'data-testid': 'content',
								children: ($$renderer) => {
									if (Tooltip.Arrow) {
										$$renderer.push('<!--[-->');

										Tooltip.Arrow($$renderer, {
											'data-testid': 'arrow',
											children: ($$renderer) => {
												if (Tooltip.ArrowTip) {
													$$renderer.push('<!--[-->');
													Tooltip.ArrowTip($$renderer, { 'data-testid': 'arrow-tip' });
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}