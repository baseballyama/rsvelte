import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AudioLines from "@lucide/svelte/icons/audio-lines";
import Plus from "@lucide/svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Button_group_input_group_demo($$anchor) {
	let voiceEnabled = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			class: '[--radius:9999rem]',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_1) => {
					ButtonGroup_Root_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'outline',
								size: 'icon',
								children: ($$anchor, $$slotProps) => {
									Plus($$anchor, {});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_2) => {
					ButtonGroup_Root_2($$anchor, {
						class: 'flex-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_3 = $.first_child(fragment_4);

							$.component(node_3, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
								InputGroup_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_4 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => $.get(voiceEnabled) ? "Record and send audio..." : "Send a message...");

											$.component(node_4, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
												InputGroup_Input($$anchor, {
													get placeholder() {
														return $.get($0);
													},

													get disabled() {
														return $.get(voiceEnabled);
													}
												});
											});
										}

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
											InputGroup_Addon($$anchor, {
												align: 'inline-end',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_6 = $.first_child(fragment_6);

													$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
														Tooltip_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root();
																var node_7 = $.first_child(fragment_7);

																{
																	const child = ($$anchor, $$arg0) => {
																		let props = () => ($$arg0?.()).props;
																		var fragment_8 = $.comment();
																		var node_8 = $.first_child(fragment_8);

																		$.component(node_8, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																			InputGroup_Button($$anchor, $.spread_props(props, {
																				onclick: () => $.set(voiceEnabled, !$.get(voiceEnabled)),
																				size: 'icon-xs',
																				get 'data-active'() {
																					return $.get(voiceEnabled);
																				},
																				class: 'data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100',
																				get 'aria-pressed'() {
																					return $.get(voiceEnabled);
																				},

																				children: ($$anchor, $$slotProps) => {
																					AudioLines($$anchor, {});
																				},
																				$$slots: { default: true }
																			}));
																		});

																		$.append($$anchor, fragment_8);
																	};

																	$.component(node_7, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																		Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
																	});
																}

																var node_9 = $.sibling(node_7, 2);

																$.component(node_9, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
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
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}