import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Select_in_dialog($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ label: "Apple", value: "apple" },
		{ label: "Banana", value: "banana" },
		{ label: "Blueberry", value: "blueberry" },
		{ label: "Grapes", value: "grapes" },
		{ label: "Pineapple", value: "pineapple" }
	];

	let selectedValue = $.state(undefined);
	const selectedLabel = $.derived(() => items.find((item) => item.value === $.get(selectedValue))?.label ?? "Select a fruit");

	Example($$anchor, {
		title: 'In Dialog',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => Button.Root, ($$anchor, Button_Root) => {
									Button_Root($$anchor, $.spread_props({ variant: 'outline' }, props, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Open Dialog');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									}));
								});

								$.append($$anchor, fragment_3);
							};

							$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
								Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_4 = $.first_child(fragment_4);

									$.component(node_4, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_5 = $.first_child(fragment_5);

												$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Select Example');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Dialog.Description, ($$anchor, Dialog_Description) => {
													Dialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Use the select below to choose a fruit.');

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

									var node_7 = $.sibling(node_4, 2);

									$.component(node_7, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return $.get(selectedValue);
											},

											set value($$value) {
												$.set(selectedValue, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_8 = $.first_child(fragment_6);

												$.component(node_8, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text();

															$.template_effect(() => $.set_text(text_3, $.get(selectedLabel)));
															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Select.Content, ($$anchor, Select_Content) => {
													Select_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = $.comment();
															var node_10 = $.first_child(fragment_8);

															$.component(node_10, () => Select.Group, ($$anchor, Select_Group) => {
																Select_Group($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = $.comment();
																		var node_11 = $.first_child(fragment_9);

																		$.each(node_11, 17, () => items, (item) => item.value, ($$anchor, item) => {
																			var fragment_10 = $.comment();
																			var node_12 = $.first_child(fragment_10);

																			$.component(node_12, () => Select.Item, ($$anchor, Select_Item) => {
																				Select_Item($$anchor, {
																					get value() {
																						return $.get(item).value;
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text();

																						$.template_effect(() => $.set_text(text_4, $.get(item).label));
																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_10);
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

												$.append($$anchor, fragment_6);
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}