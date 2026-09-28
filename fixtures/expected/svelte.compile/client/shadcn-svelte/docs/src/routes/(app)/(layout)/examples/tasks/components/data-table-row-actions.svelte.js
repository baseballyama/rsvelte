import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { labels } from "../data/data.js";
import { taskSchema } from "../data/schemas.js";

var root = $.from_html(`<!> <span class="sr-only">Open Menu</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`Delete <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Data_table_row_actions($$anchor, $$props) {
	$.push($$props, true);

	const task = $.derived(() => taskSchema.parse($$props.row.original));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'ghost',
							class: 'flex h-8 w-8 p-0 data-[state=open]:bg-muted',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								EllipsisIcon(node_2, {});
								$.next(2);
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						class: 'w-[160px]',
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_3();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
								DropdownMenu_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Edit');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
								DropdownMenu_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Make a copy');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
								DropdownMenu_Item_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Favorite');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
								DropdownMenu_Separator($$anchor, {});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
								DropdownMenu_Sub($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_9 = $.first_child(fragment_5);

										$.component(node_9, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
											DropdownMenu_SubTrigger($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Labels');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
											DropdownMenu_SubContent($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_11 = $.first_child(fragment_6);

													$.component(node_11, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
														DropdownMenu_RadioGroup($$anchor, {
															get value() {
																return $.get(task).label;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_7 = $.comment();
																var node_12 = $.first_child(fragment_7);

																$.each(node_12, 17, () => labels, (label) => label.value, ($$anchor, label) => {
																	var fragment_8 = $.comment();
																	var node_13 = $.first_child(fragment_8);

																	$.component(node_13, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
																		DropdownMenu_RadioItem($$anchor, {
																			get value() {
																				return $.get(label).value;
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_4 = $.text();

																				$.template_effect(() => $.set_text(text_4, $.get(label).label));
																				$.append($$anchor, text_4);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_8);
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

							var node_14 = $.sibling(node_8, 2);

							$.component(node_14, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
								DropdownMenu_Separator_1($$anchor, {});
							});

							var node_15 = $.sibling(node_14, 2);

							$.component(node_15, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
								DropdownMenu_Item_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_10 = root_2();
										var node_16 = $.sibling($.first_child(fragment_10));

										$.component(node_16, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
											DropdownMenu_Shortcut($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('⌘⌫');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_10);
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
	$.pop();
}