import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FloatingPanel } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Floating_panel($$anchor) {
	FloatingPanel($$anchor, {
		defaultOpen: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => FloatingPanel.Trigger, ($$anchor, FloatingPanel_Trigger) => {
				FloatingPanel_Trigger($$anchor, { 'data-testid': 'trigger' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => FloatingPanel.Positioner, ($$anchor, FloatingPanel_Positioner) => {
				FloatingPanel_Positioner($$anchor, {
					'data-testid': 'positioner',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => FloatingPanel.Content, ($$anchor, FloatingPanel_Content) => {
							FloatingPanel_Content($$anchor, {
								'data-testid': 'content',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => FloatingPanel.Header, ($$anchor, FloatingPanel_Header) => {
										FloatingPanel_Header($$anchor, {
											'data-testid': 'header',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => FloatingPanel.DragTrigger, ($$anchor, FloatingPanel_DragTrigger) => {
													FloatingPanel_DragTrigger($$anchor, { 'data-testid': 'drag-trigger' });
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => FloatingPanel.Title, ($$anchor, FloatingPanel_Title) => {
													FloatingPanel_Title($$anchor, { 'data-testid': 'title' });
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => FloatingPanel.Control, ($$anchor, FloatingPanel_Control) => {
													FloatingPanel_Control($$anchor, {
														'data-testid': 'control',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_7 = $.first_child(fragment_5);

															$.component(node_7, () => FloatingPanel.StageTrigger, ($$anchor, FloatingPanel_StageTrigger) => {
																FloatingPanel_StageTrigger($$anchor, { 'data-testid': 'stage-trigger-minimized', stage: 'minimized' });
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => FloatingPanel.StageTrigger, ($$anchor, FloatingPanel_StageTrigger_1) => {
																FloatingPanel_StageTrigger_1($$anchor, { 'data-testid': 'stage-trigger-maximized', stage: 'maximized' });
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => FloatingPanel.CloseTrigger, ($$anchor, FloatingPanel_CloseTrigger) => {
																FloatingPanel_CloseTrigger($$anchor, { 'data-testid': 'close-trigger' });
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

									var node_10 = $.sibling(node_3, 2);

									$.component(node_10, () => FloatingPanel.Body, ($$anchor, FloatingPanel_Body) => {
										FloatingPanel_Body($$anchor, { 'data-testid': 'body' });
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => FloatingPanel.ResizeTrigger, ($$anchor, FloatingPanel_ResizeTrigger) => {
										FloatingPanel_ResizeTrigger($$anchor, { 'data-testid': 'resize-trigger', axis: 'se' });
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
}