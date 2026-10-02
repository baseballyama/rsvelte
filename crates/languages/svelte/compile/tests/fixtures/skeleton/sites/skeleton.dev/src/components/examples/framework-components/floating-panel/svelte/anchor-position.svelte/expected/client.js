import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
import MaximizeIcon from '@lucide/svelte/icons/maximize';
import MinimizeIcon from '@lucide/svelte/icons/minimize';
import MinusIcon from '@lucide/svelte/icons/minus';
import XIcon from '@lucide/svelte/icons/x';
import { FloatingPanel, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> Anchored Panel`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<p>This panel is centered in the viewport using getAnchorPosition.</p> <p>The position is calculated based on the boundary rectangle.</p>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="space-y-4"><!></div>`);

export default function Anchor_position($$anchor) {
	var div = root_5();
	var node = $.child(div);

	FloatingPanel(node, {
		getAnchorPosition: (ctx) => {
			if (!ctx.triggerRect) return { x: 0, y: 0 };

			return {
				x: ctx.triggerRect.x + ctx.triggerRect.width / 2,
				y: ctx.triggerRect.y + ctx.triggerRect.height / 2
			};
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => FloatingPanel.Trigger, ($$anchor, FloatingPanel_Trigger) => {
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

			var node_2 = $.sibling(node_1, 2);

			Portal(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					$.component(node_3, () => FloatingPanel.Positioner, ($$anchor, FloatingPanel_Positioner) => {
						FloatingPanel_Positioner($$anchor, {
							class: 'z-50',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => FloatingPanel.Content, ($$anchor, FloatingPanel_Content) => {
									FloatingPanel_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_4();
											var node_5 = $.first_child(fragment_3);

											$.component(node_5, () => FloatingPanel.DragTrigger, ($$anchor, FloatingPanel_DragTrigger) => {
												FloatingPanel_DragTrigger($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_6 = $.first_child(fragment_4);

														$.component(node_6, () => FloatingPanel.Header, ($$anchor, FloatingPanel_Header) => {
															FloatingPanel_Header($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_5 = root_2();
																	var node_7 = $.first_child(fragment_5);

																	$.component(node_7, () => FloatingPanel.Title, ($$anchor, FloatingPanel_Title) => {
																		FloatingPanel_Title($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_6 = root();
																				var node_8 = $.first_child(fragment_6);

																				GripVerticalIcon(node_8, { class: 'size-4' });
																				$.next();
																				$.append($$anchor, fragment_6);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_9 = $.sibling(node_7, 2);

																	$.component(node_9, () => FloatingPanel.Control, ($$anchor, FloatingPanel_Control) => {
																		FloatingPanel_Control($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_7 = root_1();
																				var node_10 = $.first_child(fragment_7);

																				$.component(node_10, () => FloatingPanel.StageTrigger, ($$anchor, FloatingPanel_StageTrigger) => {
																					FloatingPanel_StageTrigger($$anchor, {
																						stage: 'minimized',
																						children: ($$anchor, $$slotProps) => {
																							MinusIcon($$anchor, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_11 = $.sibling(node_10, 2);

																				$.component(node_11, () => FloatingPanel.StageTrigger, ($$anchor, FloatingPanel_StageTrigger_1) => {
																					FloatingPanel_StageTrigger_1($$anchor, {
																						stage: 'maximized',
																						children: ($$anchor, $$slotProps) => {
																							MaximizeIcon($$anchor, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_12 = $.sibling(node_11, 2);

																				$.component(node_12, () => FloatingPanel.StageTrigger, ($$anchor, FloatingPanel_StageTrigger_2) => {
																					FloatingPanel_StageTrigger_2($$anchor, {
																						stage: 'default',
																						children: ($$anchor, $$slotProps) => {
																							MinimizeIcon($$anchor, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_13 = $.sibling(node_12, 2);

																				$.component(node_13, () => FloatingPanel.CloseTrigger, ($$anchor, FloatingPanel_CloseTrigger) => {
																					FloatingPanel_CloseTrigger($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							XIcon($$anchor, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_7);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_5);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var node_14 = $.sibling(node_5, 2);

											$.component(node_14, () => FloatingPanel.Body, ($$anchor, FloatingPanel_Body) => {
												FloatingPanel_Body($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_12 = root_3();

														$.next(2);
														$.append($$anchor, fragment_12);
													},
													$$slots: { default: true }
												});
											});

											var node_15 = $.sibling(node_14, 2);

											$.component(node_15, () => FloatingPanel.ResizeTrigger, ($$anchor, FloatingPanel_ResizeTrigger) => {
												FloatingPanel_ResizeTrigger($$anchor, { axis: 'se' });
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
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}