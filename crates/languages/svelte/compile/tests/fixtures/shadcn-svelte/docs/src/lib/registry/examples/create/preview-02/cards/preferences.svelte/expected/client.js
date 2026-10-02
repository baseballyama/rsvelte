import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Preferences($$anchor, $$props) {
	$.push($$props, true);

	const CURRENCIES = [
		{ label: "USD — United States Dollar", value: "usd" },
		{ label: "EUR — Euro", value: "eur" },
		{ label: "GBP — British Pound", value: "gbp" },
		{ label: "JPY — Japanese Yen", value: "jpy" }
	];

	let currency = $.state("usd");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Preferences');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Manage your account settings and notifications.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'ghost',
											size: 'icon-sm',
											class: 'bg-muted',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'XIcon',
													tabler: 'IconX',
													hugeicons: 'Cancel01Icon',
													phosphor: 'XIcon',
													remixicon: 'RiCloseLine'
												});
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_6 = $.first_child(fragment_5);

							$.component(node_6, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_2();
										var node_7 = $.first_child(fragment_6);

										$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_1();
													var node_8 = $.first_child(fragment_7);

													$.component(node_8, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'default-currency',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Default Currency');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Select.Root, ($$anchor, Select_Root) => {
														Select_Root($$anchor, {
															type: 'single',
															get value() {
																return $.get(currency);
															},

															set value($$value) {
																$.set(currency, $$value, true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root_1();
																var node_10 = $.first_child(fragment_8);

																$.component(node_10, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																	Select_Trigger($$anchor, {
																		id: 'default-currency',
																		class: 'w-full',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text();

																			$.template_effect(($0) => $.set_text(text_3, $0), [
																				() => CURRENCIES.find((c) => c.value === $.get(currency))?.label
																			]);

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_11 = $.sibling(node_10, 2);

																$.component(node_11, () => Select.Content, ($$anchor, Select_Content) => {
																	Select_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = $.comment();
																			var node_12 = $.first_child(fragment_10);

																			$.component(node_12, () => Select.Group, ($$anchor, Select_Group) => {
																				Select_Group($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_11 = $.comment();
																						var node_13 = $.first_child(fragment_11);

																						$.each(node_13, 17, () => CURRENCIES, (item) => item.value, ($$anchor, item) => {
																							var fragment_12 = $.comment();
																							var node_14 = $.first_child(fragment_12);

																							$.component(node_14, () => Select.Item, ($$anchor, Select_Item) => {
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

																							$.append($$anchor, fragment_12);
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

										var node_15 = $.sibling(node_7, 2);

										$.component(node_15, () => Field.Separator, ($$anchor, Field_Separator) => {
											Field_Separator($$anchor, { class: '-my-4' });
										});

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root_1();
													var node_17 = $.first_child(fragment_14);

													$.component(node_17, () => Field.Content, ($$anchor, Field_Content) => {
														Field_Content($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = root_1();
																var node_18 = $.first_child(fragment_15);

																$.component(node_18, () => Field.Label, ($$anchor, Field_Label_1) => {
																	Field_Label_1($$anchor, {
																		for: 'public-statistics',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('Public Statistics');

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_19 = $.sibling(node_18, 2);

																$.component(node_19, () => Field.Description, ($$anchor, Field_Description) => {
																	Field_Description($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('Allow others to see your total stream count and listening activity');

																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_15);
															},
															$$slots: { default: true }
														});
													});

													var node_20 = $.sibling(node_17, 2);

													Switch(node_20, { id: 'public-statistics', checked: true });
													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_16, 2);

										$.component(node_21, () => Field.Separator, ($$anchor, Field_Separator_1) => {
											Field_Separator_1($$anchor, { class: '-my-4' });
										});

										var node_22 = $.sibling(node_21, 2);

										$.component(node_22, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_16 = root_1();
													var node_23 = $.first_child(fragment_16);

													$.component(node_23, () => Field.Content, ($$anchor, Field_Content_1) => {
														Field_Content_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = root_1();
																var node_24 = $.first_child(fragment_17);

																$.component(node_24, () => Field.Label, ($$anchor, Field_Label_2) => {
																	Field_Label_2($$anchor, {
																		for: 'email-notifications',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_7 = $.text('Email Notifications');

																			$.append($$anchor, text_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_25 = $.sibling(node_24, 2);

																$.component(node_25, () => Field.Description, ($$anchor, Field_Description_1) => {
																	Field_Description_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text('Monthly royalty reports and distribution updates');

																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_17);
															},
															$$slots: { default: true }
														});
													});

													var node_26 = $.sibling(node_23, 2);

													Switch(node_26, { id: 'email-notifications', checked: true });
													$.append($$anchor, fragment_16);
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

				var node_27 = $.sibling(node_5, 2);

				$.component(node_27, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_18 = root_1();
							var node_28 = $.first_child(fragment_18);

							Button(node_28, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Reset');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var node_29 = $.sibling(node_28, 2);

							Button(node_29, {
								class: 'ml-auto',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Save Preferences');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_18);
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