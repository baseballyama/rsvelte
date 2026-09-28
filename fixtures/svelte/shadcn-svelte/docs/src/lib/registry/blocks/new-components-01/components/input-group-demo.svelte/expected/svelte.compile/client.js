import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import CheckIcon from "@lucide/svelte/icons/check";
import InfoIcon from "@lucide/svelte/icons/info";
import PlusIcon from "@lucide/svelte/icons/plus";
import SearchIcon from "@lucide/svelte/icons/search";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">Send</span>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"><!></div>`);
var root_5 = $.from_html(`<div class="grid w-full max-w-sm gap-6"><!> <!> <!> <!></div>`);

export default function Input_group_demo($$anchor) {
	var div = root_5();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { placeholder: 'Search...' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							SearchIcon($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('12 results');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node, 2);

	$.component(node_4, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
		InputGroup_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_5 = $.first_child(fragment_2);

				$.component(node_5, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
					InputGroup_Input_1($$anchor, { placeholder: 'example.com', class: '!ps-1' });
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
					InputGroup_Addon_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_7 = $.first_child(fragment_3);

							$.component(node_7, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
								InputGroup_Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('https://');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_6, 2);

				$.component(node_8, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
					InputGroup_Addon_3($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_9 = $.first_child(fragment_4);

							$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
								Tooltip_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_10 = $.first_child(fragment_5);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_6 = $.comment();
												var node_11 = $.first_child(fragment_6);

												$.component(node_11, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
													InputGroup_Button($$anchor, $.spread_props(props, {
														class: 'rounded-full',
														size: 'icon-xs',
														children: ($$anchor, $$slotProps) => {
															InfoIcon($$anchor, {});
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_6);
											};

											$.component(node_10, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
												Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_12 = $.sibling(node_10, 2);

										$.component(node_12, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
											Tooltip_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('This is content in a tooltip.');

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

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_13 = $.sibling(node_4, 2);

	$.component(node_13, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
		InputGroup_Root_2($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root_1();
				var node_14 = $.first_child(fragment_8);

				$.component(node_14, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea) => {
					InputGroup_Textarea($$anchor, { placeholder: 'Ask, Search or Chat...' });
				});

				var node_15 = $.sibling(node_14, 2);

				$.component(node_15, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
					InputGroup_Addon_4($$anchor, {
						align: 'block-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_3();
							var node_16 = $.first_child(fragment_9);

							$.component(node_16, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
								InputGroup_Button_1($$anchor, {
									variant: 'outline',
									class: 'rounded-full',
									size: 'icon-xs',
									children: ($$anchor, $$slotProps) => {
										PlusIcon($$anchor, {});
									},
									$$slots: { default: true }
								});
							});

							var node_17 = $.sibling(node_16, 2);

							$.component(node_17, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
								DropdownMenu_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_1();
										var node_18 = $.first_child(fragment_11);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_12 = $.comment();
												var node_19 = $.first_child(fragment_12);

												$.component(node_19, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
													InputGroup_Button_2($$anchor, $.spread_props(props, {
														variant: 'ghost',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Auto');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_12);
											};

											$.component(node_18, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
												DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_20 = $.sibling(node_18, 2);

										$.component(node_20, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
											DropdownMenu_Content($$anchor, {
												side: 'top',
												align: 'start',
												class: '[--radius:0.95rem]',
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = root();
													var node_21 = $.first_child(fragment_13);

													$.component(node_21, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
														DropdownMenu_Item($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Auto');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_22 = $.sibling(node_21, 2);

													$.component(node_22, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
														DropdownMenu_Item_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Agent');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var node_23 = $.sibling(node_22, 2);

													$.component(node_23, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
														DropdownMenu_Item_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('Manual');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_13);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							var node_24 = $.sibling(node_17, 2);

							$.component(node_24, () => InputGroup.Text, ($$anchor, InputGroup_Text_1) => {
								InputGroup_Text_1($$anchor, {
									class: 'ms-auto',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('52% used');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});
							});

							var node_25 = $.sibling(node_24, 2);

							Separator(node_25, { orientation: 'vertical', class: '!h-4' });

							var node_26 = $.sibling(node_25, 2);

							$.component(node_26, () => InputGroup.Button, ($$anchor, InputGroup_Button_3) => {
								InputGroup_Button_3($$anchor, {
									variant: 'default',
									class: 'rounded-full',
									size: 'icon-xs',
									disabled: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root_2();
										var node_27 = $.first_child(fragment_14);

										ArrowUpIcon(node_27, {});
										$.next(2);
										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});
	});

	var node_28 = $.sibling(node_13, 2);

	$.component(node_28, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
		InputGroup_Root_3($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_15 = root_1();
				var node_29 = $.first_child(fragment_15);

				$.component(node_29, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
					InputGroup_Input_2($$anchor, { placeholder: '@shadcn' });
				});

				var node_30 = $.sibling(node_29, 2);

				$.component(node_30, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_5) => {
					InputGroup_Addon_5($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_4();
							var node_31 = $.child(div_1);

							CheckIcon(node_31, { class: 'size-3' });
							$.reset(div_1);
							$.append($$anchor, div_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_15);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}