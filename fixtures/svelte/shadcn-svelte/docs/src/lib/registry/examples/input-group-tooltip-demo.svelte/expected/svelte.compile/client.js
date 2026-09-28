import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HelpCircleIcon from "@lucide/svelte/icons/help-circle";
import InfoIcon from "@lucide/svelte/icons/info";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";

var root = $.from_html(`<p>Password must be at least 8 characters</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p>We'll use this to send you notifications</p>`);
var root_3 = $.from_html(`<p>Click for help with API keys</p>`);
var root_4 = $.from_html(`<div class="grid w-full max-w-sm gap-4"><!> <!> <!></div>`);

export default function Input_group_tooltip_demo($$anchor) {
	var div = root_4();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { placeholder: 'Enter password', type: 'password' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
								Tooltip_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_1();
										var node_4 = $.first_child(fragment_2);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_3 = $.comment();
												var node_5 = $.first_child(fragment_3);

												$.component(node_5, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
													InputGroup_Button($$anchor, $.spread_props(props, {
														variant: 'ghost',
														'aria-label': 'Info',
														size: 'icon-xs',
														children: ($$anchor, $$slotProps) => {
															InfoIcon($$anchor, {});
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_3);
											};

											$.component(node_4, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
												Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_6 = $.sibling(node_4, 2);

										$.component(node_6, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
											Tooltip_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var p = root();

													$.append($$anchor, p);
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
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node, 2);

	$.component(node_7, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
		InputGroup_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_1();
				var node_8 = $.first_child(fragment_5);

				$.component(node_8, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
					InputGroup_Input_1($$anchor, { placeholder: 'Your email address' });
				});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_10 = $.first_child(fragment_6);

							$.component(node_10, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
								Tooltip_Root_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_1();
										var node_11 = $.first_child(fragment_7);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_8 = $.comment();
												var node_12 = $.first_child(fragment_8);

												$.component(node_12, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
													InputGroup_Button_1($$anchor, $.spread_props(props, {
														variant: 'ghost',
														'aria-label': 'Help',
														size: 'icon-xs',
														children: ($$anchor, $$slotProps) => {
															HelpCircleIcon($$anchor, {});
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_8);
											};

											$.component(node_11, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
												Tooltip_Trigger_1($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_13 = $.sibling(node_11, 2);

										$.component(node_13, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
											Tooltip_Content_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var p_1 = root_2();

													$.append($$anchor, p_1);
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

	var node_14 = $.sibling(node_7, 2);

	$.component(node_14, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
		InputGroup_Root_2($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_10 = root_1();
				var node_15 = $.first_child(fragment_10);

				$.component(node_15, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
					InputGroup_Input_2($$anchor, { placeholder: 'Enter API key' });
				});

				var node_16 = $.sibling(node_15, 2);

				$.component(node_16, () => Tooltip.Root, ($$anchor, Tooltip_Root_2) => {
					Tooltip_Root_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root_1();
							var node_17 = $.first_child(fragment_11);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var fragment_12 = $.comment();
									var node_18 = $.first_child(fragment_12);

									$.component(node_18, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
										InputGroup_Addon_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_13 = $.comment();
												var node_19 = $.first_child(fragment_13);

												$.component(node_19, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
													InputGroup_Button_2($$anchor, $.spread_props(props, {
														variant: 'ghost',
														'aria-label': 'Help',
														size: 'icon-xs',
														children: ($$anchor, $$slotProps) => {
															HelpCircleIcon($$anchor, {});
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_13);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_12);
								};

								$.component(node_17, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
									Tooltip_Trigger_2($$anchor, { child, $$slots: { child: true } });
								});
							}

							var node_20 = $.sibling(node_17, 2);

							$.component(node_20, () => Tooltip.Content, ($$anchor, Tooltip_Content_2) => {
								Tooltip_Content_2($$anchor, {
									side: 'left',
									children: ($$anchor, $$slotProps) => {
										var p_2 = root_3();

										$.append($$anchor, p_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_10);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}