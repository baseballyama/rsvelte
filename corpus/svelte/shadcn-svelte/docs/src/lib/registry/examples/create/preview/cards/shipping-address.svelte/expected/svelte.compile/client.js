import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Shipping_address($$anchor, $$props) {
	$.push($$props, true);

	const states = [
		{ value: "CA", label: "California" },
		{ value: "NY", label: "New York" },
		{ value: "TX", label: "Texas" }
	];

	const countries = [
		{ value: "US", label: "United States" },
		{ value: "CA", label: "Canada" },
		{ value: "UK", label: "United Kingdom" }
	];

	let selectedState = $.state($.proxy(states[0].value));
	let selectedCountry = $.state($.proxy(countries[0].value));
	let saveDefault = $.state(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
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

										var text = $.text('Shipping Address');

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

										var text_1 = $.text('Where should we deliver?');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'shipping-street',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Street address');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													Input(node_8, { id: 'shipping-street', placeholder: '123 Main Street' });
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_6, 2);

										$.component(node_9, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_10 = $.first_child(fragment_6);

													$.component(node_10, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'shipping-apt',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Apt / Suite');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_10, 2);

													Input(node_11, { id: 'shipping-apt', placeholder: 'Apt 4B' });
													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_9, 2);

										$.component(node_12, () => Field.Group, ($$anchor, Field_Group_1) => {
											Field_Group_1($$anchor, {
												class: 'grid grid-cols-2',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_13 = $.first_child(fragment_7);

													$.component(node_13, () => Field.Field, ($$anchor, Field_Field_2) => {
														Field_Field_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root();
																var node_14 = $.first_child(fragment_8);

																$.component(node_14, () => Field.Label, ($$anchor, Field_Label_2) => {
																	Field_Label_2($$anchor, {
																		for: 'shipping-city',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('City');

																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_15 = $.sibling(node_14, 2);

																Input(node_15, { id: 'shipping-city', placeholder: 'San Francisco' });
																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_13, 2);

													$.component(node_16, () => Field.Field, ($$anchor, Field_Field_3) => {
														Field_Field_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root();
																var node_17 = $.first_child(fragment_9);

																$.component(node_17, () => Field.Label, ($$anchor, Field_Label_3) => {
																	Field_Label_3($$anchor, {
																		for: 'shipping-state',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('State');

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_18 = $.sibling(node_17, 2);

																$.component(node_18, () => Select.Root, ($$anchor, Select_Root) => {
																	Select_Root($$anchor, {
																		type: 'single',
																		get value() {
																			return $.get(selectedState);
																		},

																		set value($$value) {
																			$.set(selectedState, $$value, true);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root();
																			var node_19 = $.first_child(fragment_10);

																			$.component(node_19, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																				Select_Trigger($$anchor, {
																					id: 'shipping-state',
																					class: 'w-full',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_6 = $.text();

																						$.template_effect(($0) => $.set_text(text_6, $0), [
																							() => states.find((s) => s.value === $.get(selectedState))?.label ?? "Select State"
																						]);

																						$.append($$anchor, text_6);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_20 = $.sibling(node_19, 2);

																			$.component(node_20, () => Select.Content, ($$anchor, Select_Content) => {
																				Select_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_12 = $.comment();
																						var node_21 = $.first_child(fragment_12);

																						$.each(node_21, 17, () => states, (state) => state.value, ($$anchor, state) => {
																							var fragment_13 = $.comment();
																							var node_22 = $.first_child(fragment_13);

																							$.component(node_22, () => Select.Item, ($$anchor, Select_Item) => {
																								Select_Item($$anchor, {
																									get value() {
																										return $.get(state).value;
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_7 = $.text();

																										$.template_effect(() => $.set_text(text_7, $.get(state).label));
																										$.append($$anchor, text_7);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_13);
																						});

																						$.append($$anchor, fragment_12);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_23 = $.sibling(node_12, 2);

										$.component(node_23, () => Field.Group, ($$anchor, Field_Group_2) => {
											Field_Group_2($$anchor, {
												class: 'grid grid-cols-2',
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root();
													var node_24 = $.first_child(fragment_15);

													$.component(node_24, () => Field.Field, ($$anchor, Field_Field_4) => {
														Field_Field_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_16 = root();
																var node_25 = $.first_child(fragment_16);

																$.component(node_25, () => Field.Label, ($$anchor, Field_Label_4) => {
																	Field_Label_4($$anchor, {
																		for: 'shipping-zip',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text('ZIP Code');

																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_26 = $.sibling(node_25, 2);

																Input(node_26, { id: 'shipping-zip', placeholder: '94102' });
																$.append($$anchor, fragment_16);
															},
															$$slots: { default: true }
														});
													});

													var node_27 = $.sibling(node_24, 2);

													$.component(node_27, () => Field.Field, ($$anchor, Field_Field_5) => {
														Field_Field_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = root();
																var node_28 = $.first_child(fragment_17);

																$.component(node_28, () => Field.Label, ($$anchor, Field_Label_5) => {
																	Field_Label_5($$anchor, {
																		for: 'shipping-country',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_9 = $.text('Country');

																			$.append($$anchor, text_9);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_29 = $.sibling(node_28, 2);

																$.component(node_29, () => Select.Root, ($$anchor, Select_Root_1) => {
																	Select_Root_1($$anchor, {
																		type: 'single',
																		get value() {
																			return $.get(selectedCountry);
																		},

																		set value($$value) {
																			$.set(selectedCountry, $$value, true);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_18 = root();
																			var node_30 = $.first_child(fragment_18);

																			$.component(node_30, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
																				Select_Trigger_1($$anchor, {
																					id: 'shipping-country',
																					class: 'w-full',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_10 = $.text();

																						$.template_effect(($0) => $.set_text(text_10, $0), [
																							() => countries.find((c) => c.value === $.get(selectedCountry))?.label ?? "Select Country"
																						]);

																						$.append($$anchor, text_10);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_31 = $.sibling(node_30, 2);

																			$.component(node_31, () => Select.Content, ($$anchor, Select_Content_1) => {
																				Select_Content_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_20 = $.comment();
																						var node_32 = $.first_child(fragment_20);

																						$.each(node_32, 17, () => countries, (country) => country.value, ($$anchor, country) => {
																							var fragment_21 = $.comment();
																							var node_33 = $.first_child(fragment_21);

																							$.component(node_33, () => Select.Item, ($$anchor, Select_Item_1) => {
																								Select_Item_1($$anchor, {
																									get value() {
																										return $.get(country).value;
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_11 = $.text();

																										$.template_effect(() => $.set_text(text_11, $.get(country).label));
																										$.append($$anchor, text_11);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_21);
																						});

																						$.append($$anchor, fragment_20);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_18);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_17);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										});

										var node_34 = $.sibling(node_23, 2);

										$.component(node_34, () => Field.Field, ($$anchor, Field_Field_6) => {
											Field_Field_6($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_23 = root();
													var node_35 = $.first_child(fragment_23);

													Checkbox(node_35, {
														id: 'shipping-save',
														get checked() {
															return $.get(saveDefault);
														},

														set checked($$value) {
															$.set(saveDefault, $$value, true);
														}
													});

													var node_36 = $.sibling(node_35, 2);

													$.component(node_36, () => Field.Label, ($$anchor, Field_Label_6) => {
														Field_Label_6($$anchor, {
															for: 'shipping-save',
															class: 'font-normal',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_12 = $.text('Save as default address');

																$.append($$anchor, text_12);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_23);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_37 = $.sibling(node_4, 2);

				$.component(node_37, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_24 = root();
							var node_38 = $.first_child(fragment_24);

							Button(node_38, {
								variant: 'outline',
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('Cancel');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							var node_39 = $.sibling(node_38, 2);

							Button(node_39, {
								size: 'sm',
								class: 'ml-auto',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('Save Address');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_24);
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