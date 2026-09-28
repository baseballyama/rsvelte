import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Select_scrollable($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'w-[280px]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Select a timezone');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						class: 'max-h-[300px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Select.Group, ($$anchor, Select_Group) => {
								Select_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Select.Label, ($$anchor, Select_Label) => {
											Select_Label($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('North America');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Select.Item, ($$anchor, Select_Item) => {
											Select_Item($$anchor, {
												value: 'est',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Eastern Standard Time (EST)');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Select.Item, ($$anchor, Select_Item_1) => {
											Select_Item_1($$anchor, {
												value: 'cst',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Central Standard Time (CST)');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Select.Item, ($$anchor, Select_Item_2) => {
											Select_Item_2($$anchor, {
												value: 'mst',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Mountain Standard Time (MST)');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => Select.Item, ($$anchor, Select_Item_3) => {
											Select_Item_3($$anchor, {
												value: 'pst',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Pacific Standard Time (PST)');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => Select.Item, ($$anchor, Select_Item_4) => {
											Select_Item_4($$anchor, {
												value: 'akst',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Alaska Standard Time (AKST)');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => Select.Item, ($$anchor, Select_Item_5) => {
											Select_Item_5($$anchor, {
												value: 'hst',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Hawaii Standard Time (HST)');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_3, 2);

							$.component(node_11, () => Select.Group, ($$anchor, Select_Group_1) => {
								Select_Group_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_12 = $.first_child(fragment_4);

										$.component(node_12, () => Select.Label, ($$anchor, Select_Label_1) => {
											Select_Label_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Europe & Africa');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_12, 2);

										$.component(node_13, () => Select.Item, ($$anchor, Select_Item_6) => {
											Select_Item_6($$anchor, {
												value: 'gmt',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('Greenwich Mean Time (GMT)');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_13, 2);

										$.component(node_14, () => Select.Item, ($$anchor, Select_Item_7) => {
											Select_Item_7($$anchor, {
												value: 'cet',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('Central European Time (CET)');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_14, 2);

										$.component(node_15, () => Select.Item, ($$anchor, Select_Item_8) => {
											Select_Item_8($$anchor, {
												value: 'eet',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_11 = $.text('Eastern European Time (EET)');

													$.append($$anchor, text_11);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => Select.Item, ($$anchor, Select_Item_9) => {
											Select_Item_9($$anchor, {
												value: 'west',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_12 = $.text('Western European Summer Time (WEST)');

													$.append($$anchor, text_12);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => Select.Item, ($$anchor, Select_Item_10) => {
											Select_Item_10($$anchor, {
												value: 'cat',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_13 = $.text('Central Africa Time (CAT)');

													$.append($$anchor, text_13);
												},
												$$slots: { default: true }
											});
										});

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => Select.Item, ($$anchor, Select_Item_11) => {
											Select_Item_11($$anchor, {
												value: 'eat',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_14 = $.text('East Africa Time (EAT)');

													$.append($$anchor, text_14);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_19 = $.sibling(node_11, 2);

							$.component(node_19, () => Select.Group, ($$anchor, Select_Group_2) => {
								Select_Group_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_20 = $.first_child(fragment_5);

										$.component(node_20, () => Select.Label, ($$anchor, Select_Label_2) => {
											Select_Label_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('Asia');

													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_20, 2);

										$.component(node_21, () => Select.Item, ($$anchor, Select_Item_12) => {
											Select_Item_12($$anchor, {
												value: 'msk',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text('Moscow Time (MSK)');

													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});
										});

										var node_22 = $.sibling(node_21, 2);

										$.component(node_22, () => Select.Item, ($$anchor, Select_Item_13) => {
											Select_Item_13($$anchor, {
												value: 'ist',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('India Standard Time (IST)');

													$.append($$anchor, text_17);
												},
												$$slots: { default: true }
											});
										});

										var node_23 = $.sibling(node_22, 2);

										$.component(node_23, () => Select.Item, ($$anchor, Select_Item_14) => {
											Select_Item_14($$anchor, {
												value: 'cst_china',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_18 = $.text('China Standard Time (CST)');

													$.append($$anchor, text_18);
												},
												$$slots: { default: true }
											});
										});

										var node_24 = $.sibling(node_23, 2);

										$.component(node_24, () => Select.Item, ($$anchor, Select_Item_15) => {
											Select_Item_15($$anchor, {
												value: 'jst',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_19 = $.text('Japan Standard Time (JST)');

													$.append($$anchor, text_19);
												},
												$$slots: { default: true }
											});
										});

										var node_25 = $.sibling(node_24, 2);

										$.component(node_25, () => Select.Item, ($$anchor, Select_Item_16) => {
											Select_Item_16($$anchor, {
												value: 'kst',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_20 = $.text('Korea Standard Time (KST)');

													$.append($$anchor, text_20);
												},
												$$slots: { default: true }
											});
										});

										var node_26 = $.sibling(node_25, 2);

										$.component(node_26, () => Select.Item, ($$anchor, Select_Item_17) => {
											Select_Item_17($$anchor, {
												value: 'ist_indonesia',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_21 = $.text('Indonesia Central Standard Time (WITA)');

													$.append($$anchor, text_21);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_27 = $.sibling(node_19, 2);

							$.component(node_27, () => Select.Group, ($$anchor, Select_Group_3) => {
								Select_Group_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_1();
										var node_28 = $.first_child(fragment_6);

										$.component(node_28, () => Select.Label, ($$anchor, Select_Label_3) => {
											Select_Label_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_22 = $.text('Australia & Pacific');

													$.append($$anchor, text_22);
												},
												$$slots: { default: true }
											});
										});

										var node_29 = $.sibling(node_28, 2);

										$.component(node_29, () => Select.Item, ($$anchor, Select_Item_18) => {
											Select_Item_18($$anchor, {
												value: 'awst',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_23 = $.text('Australian Western Standard Time (AWST)');

													$.append($$anchor, text_23);
												},
												$$slots: { default: true }
											});
										});

										var node_30 = $.sibling(node_29, 2);

										$.component(node_30, () => Select.Item, ($$anchor, Select_Item_19) => {
											Select_Item_19($$anchor, {
												value: 'acst',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_24 = $.text('Australian Central Standard Time (ACST)');

													$.append($$anchor, text_24);
												},
												$$slots: { default: true }
											});
										});

										var node_31 = $.sibling(node_30, 2);

										$.component(node_31, () => Select.Item, ($$anchor, Select_Item_20) => {
											Select_Item_20($$anchor, {
												value: 'aest',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_25 = $.text('Australian Eastern Standard Time (AEST)');

													$.append($$anchor, text_25);
												},
												$$slots: { default: true }
											});
										});

										var node_32 = $.sibling(node_31, 2);

										$.component(node_32, () => Select.Item, ($$anchor, Select_Item_21) => {
											Select_Item_21($$anchor, {
												value: 'nzst',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_26 = $.text('New Zealand Standard Time (NZST)');

													$.append($$anchor, text_26);
												},
												$$slots: { default: true }
											});
										});

										var node_33 = $.sibling(node_32, 2);

										$.component(node_33, () => Select.Item, ($$anchor, Select_Item_22) => {
											Select_Item_22($$anchor, {
												value: 'fjt',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_27 = $.text('Fiji Time (FJT)');

													$.append($$anchor, text_27);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var node_34 = $.sibling(node_27, 2);

							$.component(node_34, () => Select.Group, ($$anchor, Select_Group_4) => {
								Select_Group_4($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_2();
										var node_35 = $.first_child(fragment_7);

										$.component(node_35, () => Select.Label, ($$anchor, Select_Label_4) => {
											Select_Label_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_28 = $.text('South America');

													$.append($$anchor, text_28);
												},
												$$slots: { default: true }
											});
										});

										var node_36 = $.sibling(node_35, 2);

										$.component(node_36, () => Select.Item, ($$anchor, Select_Item_23) => {
											Select_Item_23($$anchor, {
												value: 'art',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_29 = $.text('Argentina Time (ART)');

													$.append($$anchor, text_29);
												},
												$$slots: { default: true }
											});
										});

										var node_37 = $.sibling(node_36, 2);

										$.component(node_37, () => Select.Item, ($$anchor, Select_Item_24) => {
											Select_Item_24($$anchor, {
												value: 'bot',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_30 = $.text('Bolivia Time (BOT)');

													$.append($$anchor, text_30);
												},
												$$slots: { default: true }
											});
										});

										var node_38 = $.sibling(node_37, 2);

										$.component(node_38, () => Select.Item, ($$anchor, Select_Item_25) => {
											Select_Item_25($$anchor, {
												value: 'brt',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_31 = $.text('Brasilia Time (BRT)');

													$.append($$anchor, text_31);
												},
												$$slots: { default: true }
											});
										});

										var node_39 = $.sibling(node_38, 2);

										$.component(node_39, () => Select.Item, ($$anchor, Select_Item_26) => {
											Select_Item_26($$anchor, {
												value: 'clt',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_32 = $.text('Chile Standard Time (CLT)');

													$.append($$anchor, text_32);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
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
}