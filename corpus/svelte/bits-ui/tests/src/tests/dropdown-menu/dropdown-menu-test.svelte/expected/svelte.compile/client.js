import 'svelte/internal/disclose-version';
import { DropdownMenu } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'checked',
	'subChecked',
	'radio',
	'group',
	'subRadio',
	'open',
	'contentProps',
	'portalProps',
	'subTriggerProps',
	'checkboxGroupProps',
	'openFocusOverride',
	'subItemProps'
]);

var root = $.from_html(`<span>item</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span>subtrigger</span>`);
var root_3 = $.from_html(`<span>Email</span>`);
var root_4 = $.from_html(`<span data-testid="sub-checkbox-indicator"> </span> sub checkbox`, 1);
var root_5 = $.from_html(`<span data-testid="checkbox-indicator"> </span> Checkbox Item`, 1);
var root_6 = $.from_html(`<span data-testid="radio-indicator-1"> </span> <span>Radio Item 1</span>`, 1);
var root_7 = $.from_html(`<span data-testid="radio-indicator-2"> </span> <span>Radio Item 2</span>`, 1);
var root_8 = $.from_html(`<span data-testid="checkbox-indicator-1"> </span> <span>Checkbox Item 1</span>`, 1);
var root_9 = $.from_html(`<span data-testid="checkbox-indicator-2"> </span> <span>Checkbox Item 2</span>`, 1);
var root_10 = $.from_html(`<button data-testid="on-open-focus-override" id="on-open-focus-override">on-open-focus-override</button>`);
var root_11 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_12 = $.from_html(`<main class="flex flex-col gap-4"><div data-testid="outside" style="bottom: 0px; right: 10px; position: absolute;">outside</div> <button data-testid="previous-button">previous button</button> <div data-testid="non-portal-container"><!></div> <button data-testid="next-button">next button</button> <button data-testid="binding"> </button> <button data-testid="checked-binding"> </button> <button data-testid="sub-checked-binding"> </button> <button aria-label="radio-main" data-testid="radio-binding"> </button> <button aria-label="radio-sub" data-testid="sub-radio-binding"> </button> <button data-testid="on-close-focus-override" id="on-close-focus-override">on-close-focus-override</button> <button aria-label="checkbox-group-binding" data-testid="checkbox-group-binding"> </button> <div id="portal-target" data-testid="portal-target"></div></main>`);

export default function Dropdown_menu_test($$anchor, $$props) {
	let checked = $.prop($$props, 'checked', 7, false),
		subChecked = $.prop($$props, 'subChecked', 7, false),
		radio = $.prop($$props, 'radio', 7, ""),
		group = $.prop($$props, 'group', 23, () => []),
		subRadio = $.prop($$props, 'subRadio', 7, ""),
		open = $.prop($$props, 'open', 7, false),
		contentProps = $.prop($$props, 'contentProps', 19, () => ({})),
		portalProps = $.prop($$props, 'portalProps', 19, () => ({})),
		subTriggerProps = $.prop($$props, 'subTriggerProps', 19, () => ({})),
		checkboxGroupProps = $.prop($$props, 'checkboxGroupProps', 19, () => ({})),
		openFocusOverride = $.prop($$props, 'openFocusOverride', 3, false),
		subItemProps = $.prop($$props, 'subItemProps', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_12();
	var div = $.sibling($.child(main), 4);
	var node = $.child(div);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
					DropdownMenu_Trigger($$anchor, {
						'data-testid': 'trigger',
						class: 'h-[500px] w-[500px]',
						'aria-expanded': undefined,
						'aria-controls': undefined,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('open');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
					DropdownMenu_Portal($$anchor, $.spread_props(portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, $.spread_props(contentProps, {
									'data-testid': 'content',
									class: 'bg-gray-100 p-4',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_11();
										var node_4 = $.first_child(fragment_2);

										$.component(node_4, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
											DropdownMenu_Separator($$anchor, { 'data-testid': 'separator' });
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
											DropdownMenu_Group($$anchor, {
												'data-testid': 'group',
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root_1();
													var node_6 = $.first_child(fragment_3);

													$.component(node_6, () => DropdownMenu.GroupHeading, ($$anchor, DropdownMenu_GroupHeading) => {
														DropdownMenu_GroupHeading($$anchor, {
															'data-testid': 'group-heading',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Stuff');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
														DropdownMenu_Item($$anchor, {
															'data-testid': 'item',
															class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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

										var node_8 = $.sibling(node_5, 2);

										$.component(node_8, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
											DropdownMenu_Sub($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_9 = $.first_child(fragment_4);

													$.component(node_9, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
														DropdownMenu_SubTrigger($$anchor, $.spread_props({ 'data-testid': 'sub-trigger' }, subTriggerProps, {
															children: ($$anchor, $$slotProps) => {
																var span_1 = root_2();

																$.append($$anchor, span_1);
															},
															$$slots: { default: true }
														}));
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal_1) => {
														DropdownMenu_Portal_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_11 = $.first_child(fragment_5);

																$.component(node_11, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																	DropdownMenu_SubContent($$anchor, {
																		'data-testid': 'sub-content',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root_1();
																			var node_12 = $.first_child(fragment_6);

																			$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																				DropdownMenu_Item_1($$anchor, $.spread_props(subItemProps, {
																					'data-testid': 'sub-item',
																					class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
																					children: ($$anchor, $$slotProps) => {
																						var span_2 = root_3();

																						$.append($$anchor, span_2);
																					},
																					$$slots: { default: true }
																				}));
																			});

																			var node_13 = $.sibling(node_12, 2);

																			{
																				const children = ($$anchor, $$arg0) => {
																					let checked = () => ($$arg0?.()).checked;
																					let _indeterminate = () => ($$arg0?.()).indeterminate;
																					var fragment_7 = root_4();
																					var span_3 = $.first_child(fragment_7);
																					var text_2 = $.only_child(span_3, true);

																					$.next();
																					$.template_effect(() => $.set_text(text_2, checked()));
																					$.append($$anchor, fragment_7);
																				};

																				$.component(node_13, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem) => {
																					DropdownMenu_CheckboxItem($$anchor, {
																						'data-testid': 'sub-checkbox-item',
																						class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
																						get checked() {
																							return subChecked();
																						},

																						set checked($$value) {
																							subChecked($$value);
																						},
																						children,
																						$$slots: { default: true }
																					});
																				});
																			}

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

										var node_14 = $.sibling(node_8, 2);

										$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
											DropdownMenu_Item_2($$anchor, {
												disabled: true,
												'data-testid': 'disabled-item',
												class: 'focus:bg-gray-100 focus:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('disabled item');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_14, 2);

										$.component(node_15, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
											DropdownMenu_Item_3($$anchor, {
												disabled: true,
												'data-testid': 'disabled-item-2',
												class: 'focus:bg-gray-100 focus:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('disabled item 2');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_15, 2);

										{
											const children = ($$anchor, $$arg0) => {
												let checked = () => ($$arg0?.()).checked;
												let _indeterminate = () => ($$arg0?.()).indeterminate;
												var fragment_8 = root_5();
												var span_4 = $.first_child(fragment_8);
												var text_5 = $.only_child(span_4, true);

												$.next();
												$.template_effect(() => $.set_text(text_5, checked()));
												$.append($$anchor, fragment_8);
											};

											$.component(node_16, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem_1) => {
												DropdownMenu_CheckboxItem_1($$anchor, {
													'data-testid': 'checkbox-item',
													class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
													get checked() {
														return checked();
													},

													set checked($$value) {
														checked($$value);
													},
													children,
													$$slots: { default: true }
												});
											});
										}

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
											DropdownMenu_Item_4($$anchor, {
												'data-testid': 'item-2',
												class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('item 2');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
											DropdownMenu_RadioGroup($$anchor, {
												'data-testid': 'radio-group',
												get value() {
													return radio();
												},

												set value($$value) {
													radio($$value);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_1();
													var node_19 = $.first_child(fragment_9);

													{
														const children = ($$anchor, $$arg0) => {
															let checked = () => ($$arg0?.()).checked;
															var fragment_10 = root_6();
															var span_5 = $.first_child(fragment_10);
															var text_7 = $.only_child(span_5, true);

															$.next(2);
															$.template_effect(() => $.set_text(text_7, checked()));
															$.append($$anchor, fragment_10);
														};

														$.component(node_19, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
															DropdownMenu_RadioItem($$anchor, {
																value: '1',
																'data-testid': 'radio-item',
																class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
																children,
																$$slots: { default: true }
															});
														});
													}

													var node_20 = $.sibling(node_19, 2);

													{
														const children = ($$anchor, $$arg0) => {
															let checked = () => ($$arg0?.()).checked;
															var fragment_11 = root_7();
															var span_6 = $.first_child(fragment_11);
															var text_8 = $.only_child(span_6, true);

															$.next(2);
															$.template_effect(() => $.set_text(text_8, checked()));
															$.append($$anchor, fragment_11);
														};

														$.component(node_20, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
															DropdownMenu_RadioItem_1($$anchor, {
																value: '2',
																'data-testid': 'radio-item-2',
																class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
																children,
																$$slots: { default: true }
															});
														});
													}

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_18, 2);

										$.component(node_21, () => DropdownMenu.CheckboxGroup, ($$anchor, DropdownMenu_CheckboxGroup) => {
											DropdownMenu_CheckboxGroup($$anchor, $.spread_props({ 'data-testid': 'checkbox-group' }, checkboxGroupProps, {
												get value() {
													return group();
												},

												set value($$value) {
													group($$value);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_12 = root_1();
													var node_22 = $.first_child(fragment_12);

													{
														const children = ($$anchor, $$arg0) => {
															let checked = () => ($$arg0?.()).checked;
															var fragment_13 = root_8();
															var span_7 = $.first_child(fragment_13);
															var text_9 = $.only_child(span_7, true);

															$.next(2);
															$.template_effect(() => $.set_text(text_9, checked()));
															$.append($$anchor, fragment_13);
														};

														$.component(node_22, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem_2) => {
															DropdownMenu_CheckboxItem_2($$anchor, {
																value: '1',
																'data-testid': 'checkbox-group-item-1',
																class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
																children,
																$$slots: { default: true }
															});
														});
													}

													var node_23 = $.sibling(node_22, 2);

													{
														const children = ($$anchor, $$arg0) => {
															let checked = () => ($$arg0?.()).checked;
															var fragment_14 = root_9();
															var span_8 = $.first_child(fragment_14);
															var text_10 = $.only_child(span_8, true);

															$.next(2);
															$.template_effect(() => $.set_text(text_10, checked()));
															$.append($$anchor, fragment_14);
														};

														$.component(node_23, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem_3) => {
															DropdownMenu_CheckboxItem_3($$anchor, {
																value: '2',
																'data-testid': 'checkbox-group-item-2',
																class: 'focus:bg-blue-100 focus:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
																children,
																$$slots: { default: true }
															});
														});
													}

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											}));
										});

										var node_24 = $.sibling(node_21, 2);

										{
											var consequent = ($$anchor) => {
												var button = root_10();

												$.append($$anchor, button);
											};

											$.if(node_24, ($$render) => {
												if (openFocusOverride()) $$render(consequent);
											});
										}

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								}));
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	$.reset(div);

	var button_1 = $.sibling(div, 4);
	var text_11 = $.only_child(button_1, true);
	var button_2 = $.sibling(button_1, 2);
	var text_12 = $.only_child(button_2, true);
	var button_3 = $.sibling(button_2, 2);
	var text_13 = $.only_child(button_3, true);
	var button_4 = $.sibling(button_3, 2);
	var text_14 = $.only_child(button_4, true);
	var button_5 = $.sibling(button_4, 2);
	var text_15 = $.only_child(button_5, true);
	var button_6 = $.sibling(button_5, 4);
	var text_16 = $.only_child(button_6, true);

	$.next(2);
	$.reset(main);

	$.template_effect(() => {
		$.set_text(text_11, open());
		$.set_text(text_12, checked());
		$.set_text(text_13, subChecked());
		$.set_text(text_14, radio());
		$.set_text(text_15, subRadio());
		$.set_text(text_16, group());
	});

	$.delegated('click', button_1, () => open(!open()));
	$.delegated('click', button_2, () => checked(!checked()));
	$.delegated('click', button_3, () => subChecked(!subChecked()));
	$.delegated('click', button_4, () => radio(""));
	$.delegated('click', button_5, () => subRadio(""));
	$.delegated('click', button_6, () => group([]));
	$.append($$anchor, main);
}

$.delegate(['click']);