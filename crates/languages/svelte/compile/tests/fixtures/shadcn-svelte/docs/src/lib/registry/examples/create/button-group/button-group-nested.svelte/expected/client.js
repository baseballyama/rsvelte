import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Button_group_nested($$anchor) {
	Example($$anchor, {
		title: 'Nested',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					ButtonGroup(node, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'outline',
								size: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'PlusIcon',
										tabler: 'IconPlus',
										hugeicons: 'PlusSignIcon',
										phosphor: 'PlusIcon',
										remixicon: 'RiAddLine'
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					ButtonGroup(node_1, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_2 = $.first_child(fragment_5);

							$.component(node_2, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
								InputGroup_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_3 = $.first_child(fragment_6);

										$.component(node_3, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
											InputGroup_Input($$anchor, { placeholder: 'Send a message...' });
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
											Tooltip_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_5 = $.first_child(fragment_7);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;
															var fragment_8 = $.comment();
															var node_6 = $.first_child(fragment_8);

															$.component(node_6, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																InputGroup_Addon($$anchor, $.spread_props({ align: 'inline-end' }, props, {
																	children: ($$anchor, $$slotProps) => {
																		IconPlaceholder($$anchor, {
																			lucide: 'AudioLinesIcon',
																			tabler: 'IconHeadphones',
																			hugeicons: 'AudioWave01Icon',
																			phosphor: 'MicrophoneIcon',
																			remixicon: 'RiMicLine'
																		});
																	},
																	$$slots: { default: true }
																}));
															});

															$.append($$anchor, fragment_8);
														};

														$.component(node_5, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
															Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_7 = $.sibling(node_5, 2);

													$.component(node_7, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
														Tooltip_Content($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Voice Mode');

																$.append($$anchor, text);
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

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}