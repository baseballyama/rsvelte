import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MaximizeIcon from '@lucide/svelte/icons/maximize';
import MinimizeIcon from '@lucide/svelte/icons/minimize';
import MinusIcon from '@lucide/svelte/icons/minus';
import XIcon from '@lucide/svelte/icons/x';
import { FloatingPanel, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p>This is a floating panel that can be dragged, resized, minimized, and maximized.</p> <p>Try dragging from the header or resizing from the bottom-right corner.</p> <!>`, 1);

export default function _page($$anchor) {
	FloatingPanel($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => FloatingPanel.Trigger, ($$anchor, FloatingPanel_Trigger) => {
				FloatingPanel_Trigger($$anchor, {
					class: 'btn preset-filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Open Panel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			Portal(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => FloatingPanel.Positioner, ($$anchor, FloatingPanel_Positioner) => {
						FloatingPanel_Positioner($$anchor, {
							class: 'z-50',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => FloatingPanel.Content, ($$anchor, FloatingPanel_Content) => {
									FloatingPanel_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_1();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => FloatingPanel.DragTrigger, ($$anchor, FloatingPanel_DragTrigger) => {
												FloatingPanel_DragTrigger($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_5 = $.first_child(fragment_5);

														$.component(node_5, () => FloatingPanel.Header, ($$anchor, FloatingPanel_Header) => {
															FloatingPanel_Header($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root_1();
																	var node_6 = $.first_child(fragment_6);

																	$.component(node_6, () => FloatingPanel.Title, ($$anchor, FloatingPanel_Title) => {
																		FloatingPanel_Title($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_1 = $.text('Floating Panel');

																				$.append($$anchor, text_1);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_7 = $.sibling(node_6, 2);

																	$.component(node_7, () => FloatingPanel.Control, ($$anchor, FloatingPanel_Control) => {
																		FloatingPanel_Control($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_7 = root();
																				var node_8 = $.first_child(fragment_7);

																				$.component(node_8, () => FloatingPanel.StageTrigger, ($$anchor, FloatingPanel_StageTrigger) => {
																					FloatingPanel_StageTrigger($$anchor, {
																						stage: 'minimized',
																						children: ($$anchor, $$slotProps) => {
																							MinusIcon($$anchor, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_9 = $.sibling(node_8, 2);

																				$.component(node_9, () => FloatingPanel.StageTrigger, ($$anchor, FloatingPanel_StageTrigger_1) => {
																					FloatingPanel_StageTrigger_1($$anchor, {
																						stage: 'maximized',
																						children: ($$anchor, $$slotProps) => {
																							MaximizeIcon($$anchor, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_10 = $.sibling(node_9, 2);

																				$.component(node_10, () => FloatingPanel.StageTrigger, ($$anchor, FloatingPanel_StageTrigger_2) => {
																					FloatingPanel_StageTrigger_2($$anchor, {
																						stage: 'default',
																						children: ($$anchor, $$slotProps) => {
																							MinimizeIcon($$anchor, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_11 = $.sibling(node_10, 2);

																				$.component(node_11, () => FloatingPanel.CloseTrigger, ($$anchor, FloatingPanel_CloseTrigger) => {
																					FloatingPanel_CloseTrigger($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							XIcon($$anchor, { className: 'size-4' });
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_7);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											var node_12 = $.sibling(node_4, 2);

											$.component(node_12, () => FloatingPanel.Body, ($$anchor, FloatingPanel_Body) => {
												FloatingPanel_Body($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_12 = root_2();
														var node_13 = $.sibling($.first_child(fragment_12), 4);

														$.component(node_13, () => FloatingPanel.ResizeTrigger, ($$anchor, FloatingPanel_ResizeTrigger) => {
															FloatingPanel_ResizeTrigger($$anchor, { axis: 'se' });
														});

														$.append($$anchor, fragment_12);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}