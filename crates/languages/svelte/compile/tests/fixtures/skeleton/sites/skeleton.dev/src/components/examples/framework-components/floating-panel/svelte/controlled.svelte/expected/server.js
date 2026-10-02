import * as $ from 'svelte/internal/server';
import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
import MaximizeIcon from '@lucide/svelte/icons/maximize';
import MinimizeIcon from '@lucide/svelte/icons/minimize';
import MinusIcon from '@lucide/svelte/icons/minus';
import XIcon from '@lucide/svelte/icons/x';
import { FloatingPanel, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Controlled($$renderer) {
	let open = false;
	let size = { width: 400, height: 300 };

	$$renderer.push(`<div class="flex flex-col gap-4"><label class="label flex items-center gap-2"><input type="checkbox" class="checkbox"${$.attr('checked', open, true)}/> <span class="label-text">Open Panel</span></label> <label class="label"><span class="label-text">Width:</span> <input type="number" class="input"${$.attr('value', size.width)}/></label> <label class="label"><span class="label-text">Height:</span> <input type="number" class="input"${$.attr('value', size.height)}/></label></div> `);

	FloatingPanel($$renderer, {
		open,
		onOpenChange: (details) => open = details.open,
		size,
		onSizeChange: (details) => size = details.size,
		children: ($$renderer) => {
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
																				$$renderer.push(`<!----> Controlled Panel`);
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
														$$renderer.push(`<p>This panel's open state and size are controlled via the inputs above.</p> <p>Try changing the values or resizing/closing the panel to see the inputs update.</p>`);
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}