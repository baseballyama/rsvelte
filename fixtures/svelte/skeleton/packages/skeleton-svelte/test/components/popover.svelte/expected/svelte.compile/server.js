import * as $ from 'svelte/internal/server';
import { Popover } from '../../src/index.js';

export default function Popover_1($$renderer) {
	Popover($$renderer, {
		children: ($$renderer) => {
			if (Popover.Anchor) {
				$$renderer.push('<!--[-->');
				Popover.Anchor($$renderer, { 'data-testid': 'anchor' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Popover.Trigger) {
				$$renderer.push('<!--[-->');
				Popover.Trigger($$renderer, { 'data-testid': 'trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Popover.Positioner) {
				$$renderer.push('<!--[-->');

				Popover.Positioner($$renderer, {
					'data-testid': 'positioner',
					children: ($$renderer) => {
						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								'data-testid': 'content',
								children: ($$renderer) => {
									if (Popover.Arrow) {
										$$renderer.push('<!--[-->');

										Popover.Arrow($$renderer, {
											'data-testid': 'arrow',
											children: ($$renderer) => {
												if (Popover.ArrowTip) {
													$$renderer.push('<!--[-->');
													Popover.ArrowTip($$renderer, { 'data-testid': 'arrow-tip' });
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

									if (Popover.Title) {
										$$renderer.push('<!--[-->');
										Popover.Title($$renderer, { 'data-testid': 'title' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Popover.Description) {
										$$renderer.push('<!--[-->');
										Popover.Description($$renderer, { 'data-testid': 'description' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Popover.CloseTrigger) {
										$$renderer.push('<!--[-->');
										Popover.CloseTrigger($$renderer, { 'data-testid': 'close-trigger' });
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