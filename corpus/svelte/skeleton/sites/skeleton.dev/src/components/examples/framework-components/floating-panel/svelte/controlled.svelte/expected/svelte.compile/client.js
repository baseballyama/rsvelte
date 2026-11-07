import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
import MaximizeIcon from '@lucide/svelte/icons/maximize';
import MinimizeIcon from '@lucide/svelte/icons/minimize';
import MinusIcon from '@lucide/svelte/icons/minus';
import XIcon from '@lucide/svelte/icons/x';
import { FloatingPanel, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> Controlled Panel`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<p>This panel's open state and size are controlled via the inputs above.</p> <p>Try changing the values or resizing/closing the panel to see the inputs update.</p>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="flex flex-col gap-4"><label class="label flex items-center gap-2"><input type="checkbox" class="checkbox"/> <span class="label-text">Open Panel</span></label> <label class="label"><span class="label-text">Width:</span> <input type="number" class="input"/></label> <label class="label"><span class="label-text">Height:</span> <input type="number" class="input"/></label></div> <!>`, 1);

export default function Controlled($$anchor) {
	let open = $.state(false);
	let size = $.state($.proxy({ width: 400, height: 300 }));
	var fragment = root_5();
	var div = $.first_child(fragment);
	var label = $.child(div);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.sibling($.child(label_1), 2);

	$.remove_input_defaults(input_1);
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.sibling($.child(label_2), 2);

	$.remove_input_defaults(input_2);
	$.reset(label_2);
	$.reset(div);

	var node = $.sibling(div, 2);

	FloatingPanel(node, {
		get open() {
			return $.get(open);
		},
		onOpenChange: (details) => $.set(open, details.open, true),
		get size() {
			return $.get(size);
		},
		onSizeChange: (details) => $.set(size, details.size, true),
		children: ($$anchor, $$slotProps) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => FloatingPanel.Positioner, ($$anchor, FloatingPanel_Positioner) => {
						FloatingPanel_Positioner($$anchor, {
							class: 'z-50',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => FloatingPanel.Content, ($$anchor, FloatingPanel_Content) => {
									FloatingPanel_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_4();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => FloatingPanel.DragTrigger, ($$anchor, FloatingPanel_DragTrigger) => {
												FloatingPanel_DragTrigger($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_4 = $.first_child(fragment_5);

														$.component(node_4, () => FloatingPanel.Header, ($$anchor, FloatingPanel_Header) => {
															FloatingPanel_Header($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root_2();
																	var node_5 = $.first_child(fragment_6);

																	$.component(node_5, () => FloatingPanel.Title, ($$anchor, FloatingPanel_Title) => {
																		FloatingPanel_Title($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_7 = root();
																				var node_6 = $.first_child(fragment_7);

																				GripVerticalIcon(node_6, { class: 'size-4' });
																				$.next();
																				$.append($$anchor, fragment_7);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_7 = $.sibling(node_5, 2);

																	$.component(node_7, () => FloatingPanel.Control, ($$anchor, FloatingPanel_Control) => {
																		FloatingPanel_Control($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_8 = root_1();
																				var node_8 = $.first_child(fragment_8);

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
																							XIcon($$anchor, { class: 'size-4' });
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_8);
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

											var node_12 = $.sibling(node_3, 2);

											$.component(node_12, () => FloatingPanel.Body, ($$anchor, FloatingPanel_Body) => {
												FloatingPanel_Body($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_13 = root_3();

														$.next(2);
														$.append($$anchor, fragment_13);
													},
													$$slots: { default: true }
												});
											});

											var node_13 = $.sibling(node_12, 2);

											$.component(node_13, () => FloatingPanel.ResizeTrigger, ($$anchor, FloatingPanel_ResizeTrigger) => {
												FloatingPanel_ResizeTrigger($$anchor, { axis: 'se' });
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
		},
		$$slots: { default: true }
	});

	$.bind_checked(input, () => $.get(open), ($$value) => $.set(open, $$value));
	$.bind_value(input_1, () => $.get(size).width, ($$value) => $.get(size).width = $$value);
	$.bind_value(input_2, () => $.get(size).height, ($$value) => $.get(size).height = $$value);
	$.append($$anchor, fragment);
}