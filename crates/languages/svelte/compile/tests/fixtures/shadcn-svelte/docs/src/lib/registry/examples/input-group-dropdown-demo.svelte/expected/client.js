import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import MoreHorizontalIcon from "@lucide/svelte/icons/more-horizontal";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`Search In... <!>`, 1);
var root_3 = $.from_html(`<div class="grid w-full max-w-sm gap-4"><!> <!></div>`);

export default function Input_group_dropdown_demo($$anchor) {
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { placeholder: 'Enter file name' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
								DropdownMenu_Root($$anchor, {
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
														'aria-label': 'More',
														size: 'icon-xs',
														children: ($$anchor, $$slotProps) => {
															MoreHorizontalIcon($$anchor, {});
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_3);
											};

											$.component(node_4, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
												DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_6 = $.sibling(node_4, 2);

										$.component(node_6, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
											DropdownMenu_Content($$anchor, {
												align: 'end',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
														DropdownMenu_Item($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Settings');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
														DropdownMenu_Item_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Copy path');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
														DropdownMenu_Item_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Open location');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
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

	var node_10 = $.sibling(node, 2);

	$.component(node_10, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
		InputGroup_Root_1($$anchor, {
			class: '[--radius:1rem]',
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_1();
				var node_11 = $.first_child(fragment_6);

				$.component(node_11, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
					InputGroup_Input_1($$anchor, { placeholder: 'Enter search query' });
				});

				var node_12 = $.sibling(node_11, 2);

				$.component(node_12, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_13 = $.first_child(fragment_7);

							$.component(node_13, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
								DropdownMenu_Root_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_1();
										var node_14 = $.first_child(fragment_8);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_9 = $.comment();
												var node_15 = $.first_child(fragment_9);

												$.component(node_15, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
													InputGroup_Button_1($$anchor, $.spread_props(props, {
														variant: 'ghost',
														class: '!pe-1.5 text-xs',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_10 = root_2();
															var node_16 = $.sibling($.first_child(fragment_10));

															ChevronDownIcon(node_16, { class: 'size-3' });
															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_9);
											};

											$.component(node_14, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
												DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_17 = $.sibling(node_14, 2);

										$.component(node_17, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
											DropdownMenu_Content_1($$anchor, {
												align: 'end',
												class: '[--radius:0.95rem]',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root();
													var node_18 = $.first_child(fragment_11);

													$.component(node_18, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
														DropdownMenu_Item_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Documentation');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_18, 2);

													$.component(node_19, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
														DropdownMenu_Item_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Blog Posts');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_20 = $.sibling(node_19, 2);

													$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
														DropdownMenu_Item_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Changelog');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
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

	$.reset(div);
	$.append($$anchor, div);
}