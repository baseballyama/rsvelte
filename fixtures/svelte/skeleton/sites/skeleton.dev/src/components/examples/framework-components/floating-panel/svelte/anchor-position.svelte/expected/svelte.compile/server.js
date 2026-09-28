import * as $ from 'svelte/internal/server';
import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
import MaximizeIcon from '@lucide/svelte/icons/maximize';
import MinimizeIcon from '@lucide/svelte/icons/minimize';
import MinusIcon from '@lucide/svelte/icons/minus';
import XIcon from '@lucide/svelte/icons/x';
import { FloatingPanel, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Anchor_position($$renderer) {
	$$renderer.push(`<div class="space-y-4">`);

	FloatingPanel($$renderer, {
		getAnchorPosition: (ctx) => {
			if (!ctx.triggerRect) return { x: 0, y: 0 };

			return {
				x: ctx.triggerRect.x + ctx.triggerRect.width / 2,
				y: ctx.triggerRect.y + ctx.triggerRect.height / 2
			};
		},

		children: ($$renderer) => {
			if (FloatingPanel.Trigger) {
				$$renderer.push('<!--[-->');

				FloatingPanel.Trigger($$renderer, {
					class: 'btn preset-filled',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Panel`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Portal($$renderer, {
				children: ($$renderer) => {
					if (FloatingPanel.Positioner) {
						$$renderer.push('<!--[-->');

						FloatingPanel.Positioner($$renderer, {
							class: 'z-50',
							children: ($$renderer) => {
								if (FloatingPanel.Content) {
									$$renderer.push('<!--[-->');

									FloatingPanel.Content($$renderer, {
										children: ($$renderer) => {
											if (FloatingPanel.DragTrigger) {
												$$renderer.push('<!--[-->');

												FloatingPanel.DragTrigger($$renderer, {
													children: ($$renderer) => {
														if (FloatingPanel.Header) {
															$$renderer.push('<!--[-->');

															FloatingPanel.Header($$renderer, {
																children: ($$renderer) => {
																	if (FloatingPanel.Title) {
																		$$renderer.push('<!--[-->');

																		FloatingPanel.Title($$renderer, {
																			children: ($$renderer) => {
																				GripVerticalIcon($$renderer, { class: 'size-4' });
																				$$renderer.push(`<!----> Anchored Panel`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (FloatingPanel.Control) {
																		$$renderer.push('<!--[-->');

																		FloatingPanel.Control($$renderer, {
																			children: ($$renderer) => {
																				if (FloatingPanel.StageTrigger) {
																					$$renderer.push('<!--[-->');

																					FloatingPanel.StageTrigger($$renderer, {
																						stage: 'minimized',
																						children: ($$renderer) => {
																							MinusIcon($$renderer, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (FloatingPanel.StageTrigger) {
																					$$renderer.push('<!--[-->');

																					FloatingPanel.StageTrigger($$renderer, {
																						stage: 'maximized',
																						children: ($$renderer) => {
																							MaximizeIcon($$renderer, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (FloatingPanel.StageTrigger) {
																					$$renderer.push('<!--[-->');

																					FloatingPanel.StageTrigger($$renderer, {
																						stage: 'default',
																						children: ($$renderer) => {
																							MinimizeIcon($$renderer, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (FloatingPanel.CloseTrigger) {
																					$$renderer.push('<!--[-->');

																					FloatingPanel.CloseTrigger($$renderer, {
																						children: ($$renderer) => {
																							XIcon($$renderer, { class: 'size-4' });
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

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (FloatingPanel.Body) {
												$$renderer.push('<!--[-->');

												FloatingPanel.Body($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<p>This panel is centered in the viewport using getAnchorPosition.</p> <p>The position is calculated based on the boundary rectangle.</p>`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (FloatingPanel.ResizeTrigger) {
												$$renderer.push('<!--[-->');
												FloatingPanel.ResizeTrigger($$renderer, { axis: 'se' });
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}