import * as $ from 'svelte/internal/server';
import { FloatingPanel } from '../../src/index.js';

export default function Floating_panel($$renderer) {
	FloatingPanel($$renderer, {
		defaultOpen: true,
		children: ($$renderer) => {
			if (FloatingPanel.Trigger) {
				$$renderer.push('<!--[-->');
				FloatingPanel.Trigger($$renderer, { 'data-testid': 'trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (FloatingPanel.Positioner) {
				$$renderer.push('<!--[-->');

				FloatingPanel.Positioner($$renderer, {
					'data-testid': 'positioner',
					children: ($$renderer) => {
						if (FloatingPanel.Content) {
							$$renderer.push('<!--[-->');

							FloatingPanel.Content($$renderer, {
								'data-testid': 'content',
								children: ($$renderer) => {
									if (FloatingPanel.Header) {
										$$renderer.push('<!--[-->');

										FloatingPanel.Header($$renderer, {
											'data-testid': 'header',
											children: ($$renderer) => {
												if (FloatingPanel.DragTrigger) {
													$$renderer.push('<!--[-->');
													FloatingPanel.DragTrigger($$renderer, { 'data-testid': 'drag-trigger' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (FloatingPanel.Title) {
													$$renderer.push('<!--[-->');
													FloatingPanel.Title($$renderer, { 'data-testid': 'title' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (FloatingPanel.Control) {
													$$renderer.push('<!--[-->');

													FloatingPanel.Control($$renderer, {
														'data-testid': 'control',
														children: ($$renderer) => {
															if (FloatingPanel.StageTrigger) {
																$$renderer.push('<!--[-->');
																FloatingPanel.StageTrigger($$renderer, { 'data-testid': 'stage-trigger-minimized', stage: 'minimized' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (FloatingPanel.StageTrigger) {
																$$renderer.push('<!--[-->');
																FloatingPanel.StageTrigger($$renderer, { 'data-testid': 'stage-trigger-maximized', stage: 'maximized' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (FloatingPanel.CloseTrigger) {
																$$renderer.push('<!--[-->');
																FloatingPanel.CloseTrigger($$renderer, { 'data-testid': 'close-trigger' });
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

									$$renderer.push(` `);

									if (FloatingPanel.Body) {
										$$renderer.push('<!--[-->');
										FloatingPanel.Body($$renderer, { 'data-testid': 'body' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (FloatingPanel.ResizeTrigger) {
										$$renderer.push('<!--[-->');
										FloatingPanel.ResizeTrigger($$renderer, { 'data-testid': 'resize-trigger', axis: 'se' });
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