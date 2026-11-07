import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<form><!></form>`);

export default function Forms($$anchor) {
	const id = $.props_id();

	const plans = [
		{
			id: "starter",
			name: "Starter Plan",
			description: "For small businesses.",
			price: "$10"
		},

		{
			id: "pro",
			name: "Pro Plan",
			description: "More features and storage.",
			price: "$20"
		}
	];

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
									class: 'text-lg',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Upgrade your subscription');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									class: 'text-balance',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('You are currently on the free plan. Upgrade to the pro plan to get access to all features.');

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
							var form = root_3();
							var node_5 = $.child(form);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_2();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Field.Group, ($$anchor, Field_Group_1) => {
											Field_Group_1($$anchor, {
												class: 'grid grid-cols-2',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_7 = $.first_child(fragment_4);

													$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
														Field_Field($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();
																var node_8 = $.first_child(fragment_5);

																$.component(node_8, () => Field.Label, ($$anchor, Field_Label) => {
																	Field_Label($$anchor, {
																		get for() {
																			return `name-${id}`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Name');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_9 = $.sibling(node_8, 2);

																Input(node_9, {
																	get id() {
																		return `name-${id}`;
																	},
																	placeholder: 'Max Leiter'
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_7, 2);

													$.component(node_10, () => Field.Field, ($$anchor, Field_Field_1) => {
														Field_Field_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_11 = $.first_child(fragment_6);

																$.component(node_11, () => Field.Label, ($$anchor, Field_Label_1) => {
																	Field_Label_1($$anchor, {
																		get for() {
																			return `email-${id}`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Email');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_12 = $.sibling(node_11, 2);

																Input(node_12, {
																	get id() {
																		return `email-${id}`;
																	},
																	placeholder: 'mail@acme.com'
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

										var node_13 = $.sibling(node_6, 2);

										$.component(node_13, () => Field.Group, ($$anchor, Field_Group_2) => {
											Field_Group_2($$anchor, {
												class: 'grid grid-cols-2 gap-3 md:grid-cols-[1fr_80px_60px]',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_1();
													var node_14 = $.first_child(fragment_7);

													$.component(node_14, () => Field.Field, ($$anchor, Field_Field_2) => {
														Field_Field_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root();
																var node_15 = $.first_child(fragment_8);

																$.component(node_15, () => Field.Label, ($$anchor, Field_Label_2) => {
																	Field_Label_2($$anchor, {
																		get for() {
																			return `card-number-${id}`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('Card Number');

																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_16 = $.sibling(node_15, 2);

																Input(node_16, {
																	get id() {
																		return `card-number-${id}`;
																	},
																	placeholder: '1234 1234 1234 1234',
																	class: 'col-span-2 md:col-span-1'
																});

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													var node_17 = $.sibling(node_14, 2);

													$.component(node_17, () => Field.Field, ($$anchor, Field_Field_3) => {
														Field_Field_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root();
																var node_18 = $.first_child(fragment_9);

																$.component(node_18, () => Field.Label, ($$anchor, Field_Label_3) => {
																	Field_Label_3($$anchor, {
																		get for() {
																			return `card-number-expiry-${id}`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('Expiry Date');

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_19 = $.sibling(node_18, 2);

																Input(node_19, {
																	get id() {
																		return `card-number-expiry-${id}`;
																	},
																	placeholder: 'MM/YY'
																});

																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													var node_20 = $.sibling(node_17, 2);

													$.component(node_20, () => Field.Field, ($$anchor, Field_Field_4) => {
														Field_Field_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root();
																var node_21 = $.first_child(fragment_10);

																$.component(node_21, () => Field.Label, ($$anchor, Field_Label_4) => {
																	Field_Label_4($$anchor, {
																		get for() {
																			return `card-number-cvc-${id}`;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('CVC');

																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_22 = $.sibling(node_21, 2);

																Input(node_22, {
																	get id() {
																		return `card-number-cvc-${id}`;
																	},
																	placeholder: 'CVC'
																});

																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_23 = $.sibling(node_13, 2);

										$.component(node_23, () => Field.Set, ($$anchor, Field_Set) => {
											Field_Set($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root_1();
													var node_24 = $.first_child(fragment_11);

													$.component(node_24, () => Field.Legend, ($$anchor, Field_Legend) => {
														Field_Legend($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Plan');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_25 = $.sibling(node_24, 2);

													$.component(node_25, () => Field.Description, ($$anchor, Field_Description) => {
														Field_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('Select the plan that best fits your needs.');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													var node_26 = $.sibling(node_25, 2);

													$.component(node_26, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
														RadioGroup_Root($$anchor, {
															value: 'starter',
															class: 'grid grid-cols-2 gap-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = $.comment();
																var node_27 = $.first_child(fragment_12);

																$.each(node_27, 17, () => plans, (plan) => plan.id, ($$anchor, plan) => {
																	var fragment_13 = $.comment();
																	var node_28 = $.first_child(fragment_13);

																	$.component(node_28, () => Field.Label, ($$anchor, Field_Label_5) => {
																		Field_Label_5($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_14 = $.comment();
																				var node_29 = $.first_child(fragment_14);

																				$.component(node_29, () => Field.Field, ($$anchor, Field_Field_5) => {
																					Field_Field_5($$anchor, {
																						orientation: 'horizontal',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_15 = root();
																							var node_30 = $.first_child(fragment_15);

																							$.component(node_30, () => Field.Content, ($$anchor, Field_Content) => {
																								Field_Content($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_16 = root();
																										var node_31 = $.first_child(fragment_16);

																										$.component(node_31, () => Field.Title, ($$anchor, Field_Title) => {
																											Field_Title($$anchor, {
																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_9 = $.text();

																													$.template_effect(() => $.set_text(text_9, $.get(plan).name));
																													$.append($$anchor, text_9);
																												},
																												$$slots: { default: true }
																											});
																										});

																										var node_32 = $.sibling(node_31, 2);

																										$.component(node_32, () => Field.Description, ($$anchor, Field_Description_1) => {
																											Field_Description_1($$anchor, {
																												class: 'text-xs',
																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_10 = $.text();

																													$.template_effect(() => $.set_text(text_10, $.get(plan).description));
																													$.append($$anchor, text_10);
																												},
																												$$slots: { default: true }
																											});
																										});

																										$.append($$anchor, fragment_16);
																									},
																									$$slots: { default: true }
																								});
																							});

																							var node_33 = $.sibling(node_30, 2);

																							$.component(node_33, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
																								RadioGroup_Item($$anchor, {
																									get value() {
																										return $.get(plan).id;
																									},

																									get id() {
																										return $.get(plan).name;
																									}
																								});
																							});

																							$.append($$anchor, fragment_15);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_14);
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

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										var node_34 = $.sibling(node_23, 2);

										$.component(node_34, () => Field.Field, ($$anchor, Field_Field_6) => {
											Field_Field_6($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_19 = root();
													var node_35 = $.first_child(fragment_19);

													$.component(node_35, () => Field.Label, ($$anchor, Field_Label_6) => {
														Field_Label_6($$anchor, {
															for: 'notes',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_11 = $.text('Notes');

																$.append($$anchor, text_11);
															},
															$$slots: { default: true }
														});
													});

													var node_36 = $.sibling(node_35, 2);

													Textarea(node_36, { id: 'notes', placeholder: 'Enter notes' });
													$.append($$anchor, fragment_19);
												},
												$$slots: { default: true }
											});
										});

										var node_37 = $.sibling(node_34, 2);

										$.component(node_37, () => Field.Field, ($$anchor, Field_Field_7) => {
											Field_Field_7($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_20 = root();
													var node_38 = $.first_child(fragment_20);

													$.component(node_38, () => Field.Field, ($$anchor, Field_Field_8) => {
														Field_Field_8($$anchor, {
															orientation: 'horizontal',
															children: ($$anchor, $$slotProps) => {
																var fragment_21 = root();
																var node_39 = $.first_child(fragment_21);

																Checkbox(node_39, { id: 'terms' });

																var node_40 = $.sibling(node_39, 2);

																$.component(node_40, () => Field.Label, ($$anchor, Field_Label_7) => {
																	Field_Label_7($$anchor, {
																		for: 'terms',
																		class: 'font-normal',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_12 = $.text('I agree to the terms and conditions');

																			$.append($$anchor, text_12);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_21);
															},
															$$slots: { default: true }
														});
													});

													var node_41 = $.sibling(node_38, 2);

													$.component(node_41, () => Field.Field, ($$anchor, Field_Field_9) => {
														Field_Field_9($$anchor, {
															orientation: 'horizontal',
															children: ($$anchor, $$slotProps) => {
																var fragment_22 = root();
																var node_42 = $.first_child(fragment_22);

																Checkbox(node_42, { id: 'newsletter', checked: true });

																var node_43 = $.sibling(node_42, 2);

																$.component(node_43, () => Field.Label, ($$anchor, Field_Label_8) => {
																	Field_Label_8($$anchor, {
																		for: 'newsletter',
																		class: 'font-normal',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_13 = $.text('Allow us to send you emails');

																			$.append($$anchor, text_13);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_22);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_20);
												},
												$$slots: { default: true }
											});
										});

										var node_44 = $.sibling(node_37, 2);

										$.component(node_44, () => Field.Field, ($$anchor, Field_Field_10) => {
											Field_Field_10($$anchor, {
												orientation: 'horizontal',
												children: ($$anchor, $$slotProps) => {
													var fragment_23 = root();
													var node_45 = $.first_child(fragment_23);

													Button(node_45, {
														variant: 'outline',
														size: 'sm',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_14 = $.text('Cancel');

															$.append($$anchor, text_14);
														},
														$$slots: { default: true }
													});

													var node_46 = $.sibling(node_45, 2);

													Button(node_46, {
														size: 'sm',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_15 = $.text('Upgrade Plan');

															$.append($$anchor, text_15);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_23);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);
							$.append($$anchor, form);
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