import 'svelte/internal/disclose-version';
import { Menubar } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'id', 'subTriggerProps']);
var root = $.from_html(`<span>item</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span>subtrigger</span>`);
var root_3 = $.from_html(`<span>Email</span>`);
var root_4 = $.from_html(`<span>checked</span>`);
var root_5 = $.from_html(`<!> sub checkbox`, 1);
var root_6 = $.from_html(`<!> Checkbox Item`, 1);
var root_7 = $.from_html(`<!> <span>Radio Item 1</span>`, 1);
var root_8 = $.from_html(`<!> <span>Radio Item 2</span>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Menubar_menu_test($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Menubar.Menu, ($$anchor, Menubar_Menu) => {
		Menubar_Menu($$anchor, $.spread_props(() => restProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Menubar.Trigger, ($$anchor, Menubar_Trigger) => {
					Menubar_Trigger($$anchor, {
						get 'data-testid'() {
							return `${$$props.id ?? ''}-trigger`;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('open');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Menubar.Content, ($$anchor, Menubar_Content) => {
					Menubar_Content($$anchor, {
						get 'data-testid'() {
							return `${$$props.id ?? ''}-content`;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_9();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Menubar.Separator, ($$anchor, Menubar_Separator) => {
								Menubar_Separator($$anchor, {
									get 'data-testid'() {
										return `${$$props.id ?? ''}-separator`;
									}
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Menubar.Group, ($$anchor, Menubar_Group) => {
								Menubar_Group($$anchor, {
									get 'data-testid'() {
										return `${$$props.id ?? ''}-group`;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Menubar.GroupHeading, ($$anchor, Menubar_GroupHeading) => {
											Menubar_GroupHeading($$anchor, {
												get 'data-testid'() {
													return `${$$props.id ?? ''}-group-heading`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Stuff');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Menubar.Item, ($$anchor, Menubar_Item) => {
											Menubar_Item($$anchor, {
												get 'data-testid'() {
													return `${$$props.id ?? ''}-item`;
												},

												children: ($$anchor, $$slotProps) => {
													var span = root();

													$.append($$anchor, span);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_4, 2);

							$.component(node_7, () => Menubar.Sub, ($$anchor, Menubar_Sub) => {
								Menubar_Sub($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_8 = $.first_child(fragment_4);

										$.component(node_8, () => Menubar.SubTrigger, ($$anchor, Menubar_SubTrigger) => {
											Menubar_SubTrigger($$anchor, $.spread_props(
												{
													get 'data-testid'() {
														return `${$$props.id ?? ''}-sub-trigger`;
													}
												},
												() => $$props.subTriggerProps,
												{
													children: ($$anchor, $$slotProps) => {
														var span_1 = root_2();

														$.append($$anchor, span_1);
													},
													$$slots: { default: true }
												}
											));
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => Menubar.SubContent, ($$anchor, Menubar_SubContent) => {
											Menubar_SubContent($$anchor, {
												get 'data-testid'() {
													return `${$$props.id ?? ''}-sub-content`;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var node_10 = $.first_child(fragment_5);

													$.component(node_10, () => Menubar.Item, ($$anchor, Menubar_Item_1) => {
														Menubar_Item_1($$anchor, {
															get 'data-testid'() {
																return `${$$props.id ?? ''}-sub-item`;
															},

															children: ($$anchor, $$slotProps) => {
																var span_2 = root_3();

																$.append($$anchor, span_2);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_10, 2);

													{
														const children = ($$anchor, $$arg0) => {
															let checked = () => ($$arg0?.()).checked;
															let _indeterminate = () => ($$arg0?.()).indeterminate;
															var fragment_6 = root_5();
															var node_12 = $.first_child(fragment_6);

															{
																var consequent = ($$anchor) => {
																	var span_3 = root_4();

																	$.template_effect(() => $.set_attribute(span_3, 'data-testid', `${$$props.id ?? ''}-sub-checkbox-indicator`));
																	$.append($$anchor, span_3);
																};

																$.if(node_12, ($$render) => {
																	if (checked()) $$render(consequent);
																});
															}

															$.next();
															$.append($$anchor, fragment_6);
														};

														$.component(node_11, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem) => {
															Menubar_CheckboxItem($$anchor, {
																get 'data-testid'() {
																	return `${$$props.id ?? ''}-sub-checkbox-item`;
																},
																children,
																$$slots: { default: true }
															});
														});
													}

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

							var node_13 = $.sibling(node_7, 2);

							$.component(node_13, () => Menubar.Item, ($$anchor, Menubar_Item_2) => {
								Menubar_Item_2($$anchor, {
									disabled: true,
									get 'data-testid'() {
										return `${$$props.id ?? ''}-disabled-item`;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('disabled item');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_13, 2);

							$.component(node_14, () => Menubar.Item, ($$anchor, Menubar_Item_3) => {
								Menubar_Item_3($$anchor, {
									disabled: true,
									get 'data-testid'() {
										return `${$$props.id ?? ''}-disabled-item-2`;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('disabled item 2');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_15 = $.sibling(node_14, 2);

							{
								const children = ($$anchor, $$arg0) => {
									let checked = () => ($$arg0?.()).checked;
									let _indeterminate = () => ($$arg0?.()).indeterminate;
									var fragment_7 = root_6();
									var node_16 = $.first_child(fragment_7);

									{
										var consequent_1 = ($$anchor) => {
											var span_4 = root_4();

											$.template_effect(() => $.set_attribute(span_4, 'data-testid', `${$$props.id ?? ''}-checkbox-indicator`));
											$.append($$anchor, span_4);
										};

										$.if(node_16, ($$render) => {
											if (checked()) $$render(consequent_1);
										});
									}

									$.next();
									$.append($$anchor, fragment_7);
								};

								$.component(node_15, () => Menubar.CheckboxItem, ($$anchor, Menubar_CheckboxItem_1) => {
									Menubar_CheckboxItem_1($$anchor, {
										get 'data-testid'() {
											return `${$$props.id ?? ''}-checkbox-item`;
										},
										children,
										$$slots: { default: true }
									});
								});
							}

							var node_17 = $.sibling(node_15, 2);

							$.component(node_17, () => Menubar.Item, ($$anchor, Menubar_Item_4) => {
								Menubar_Item_4($$anchor, {
									get 'data-testid'() {
										return `${$$props.id ?? ''}-item-2`;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('item 2');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							var node_18 = $.sibling(node_17, 2);

							$.component(node_18, () => Menubar.RadioGroup, ($$anchor, Menubar_RadioGroup) => {
								Menubar_RadioGroup($$anchor, {
									get 'data-testid'() {
										return `${$$props.id ?? ''}-radio-group`;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_1();
										var node_19 = $.first_child(fragment_8);

										{
											const children = ($$anchor, $$arg0) => {
												let checked = () => ($$arg0?.()).checked;
												var fragment_9 = root_7();
												var node_20 = $.first_child(fragment_9);

												{
													var consequent_2 = ($$anchor) => {
														var span_5 = root_4();

														$.template_effect(() => $.set_attribute(span_5, 'data-testid', `${$$props.id ?? ''}-radio-indicator-1`));
														$.append($$anchor, span_5);
													};

													$.if(node_20, ($$render) => {
														if (checked()) $$render(consequent_2);
													});
												}

												$.next(2);
												$.append($$anchor, fragment_9);
											};

											$.component(node_19, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem) => {
												Menubar_RadioItem($$anchor, {
													value: '1',
													get 'data-testid'() {
														return `${$$props.id ?? ''}-radio-item`;
													},
													children,
													$$slots: { default: true }
												});
											});
										}

										var node_21 = $.sibling(node_19, 2);

										{
											const children = ($$anchor, $$arg0) => {
												let checked = () => ($$arg0?.()).checked;
												var fragment_10 = root_8();
												var node_22 = $.first_child(fragment_10);

												{
													var consequent_3 = ($$anchor) => {
														var span_6 = root_4();

														$.template_effect(() => $.set_attribute(span_6, 'data-testid', `${$$props.id ?? ''}-radio-indicator-2`));
														$.append($$anchor, span_6);
													};

													$.if(node_22, ($$render) => {
														if (checked()) $$render(consequent_3);
													});
												}

												$.next(2);
												$.append($$anchor, fragment_10);
											};

											$.component(node_21, () => Menubar.RadioItem, ($$anchor, Menubar_RadioItem_1) => {
												Menubar_RadioItem_1($$anchor, {
													value: '2',
													get 'data-testid'() {
														return `${$$props.id ?? ''}-radio-item-2`;
													},
													children,
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_8);
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
		}));
	});

	$.append($$anchor, fragment);
}