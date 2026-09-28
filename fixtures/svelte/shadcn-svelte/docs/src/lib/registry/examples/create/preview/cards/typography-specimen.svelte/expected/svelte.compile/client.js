import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { FONTS } from "$lib/fonts.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(
	`<div class="text-xs font-medium tracking-wide text-muted-foreground uppercase"> </div> <p class="cn-font-heading text-2xl font-medium">Designing with rhythm and hierarchy.</p> <p class="text-sm leading-relaxed text-muted-foreground">A strong body style keeps long-form content readable and balances the visual weight of
			headings.</p> <p class="text-sm leading-relaxed text-muted-foreground">Thoughtful spacing and cadence help paragraphs scan quickly without feeling dense.</p>`,
	1
);

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-2 gap-3"><!> <!></div> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Typography_specimen($$anchor, $$props) {
	$.push($$props, true);

	const designSystem = useDesignSystem();
	const currentBody = $.derived(() => FONTS.find((f) => f.value === designSystem.font));

	const currentHeading = $.derived(() => designSystem.fontHeading === "inherit"
		? undefined
		: FONTS.find((f) => f.value === designSystem.fontHeading));

	const headingLabel = $.derived(() => $.get(currentHeading)?.name && $.get(currentHeading).name !== $.get(currentBody)?.name ? $.get(currentHeading).name : "Inherit");
	const bodyLabel = $.derived(() => $.get(currentBody)?.name ?? "Default");

	const categoryItems = [
		{ label: "General", value: "general" },
		{ label: "Bug Report", value: "bug" },
		{ label: "Feature Request", value: "feature" },
		{ label: "Improvement", value: "improvement" }
	];

	let categoryValue = $.state("general");
	const categoryLabel = $.derived(() => categoryItems.find((item) => item.value === $.get(categoryValue))?.label ?? "General");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var div = $.first_child(fragment_2);
							var text = $.only_child(div);

							$.next(6);
							$.template_effect(() => $.set_text(text, `${$.get(headingLabel) ?? ''} - ${$.get(bodyLabel) ?? ''}`));
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => Dialog.Root, ($$anchor, Dialog_Root) => {
								Dialog_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_4 = $.first_child(fragment_4);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props({ variant: 'outline', class: 'w-full' }, props, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Share Feedback');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_4, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
												Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Content, ($$anchor, Dialog_Content) => {
											Dialog_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_3();
													var node_6 = $.first_child(fragment_6);

													$.component(node_6, () => Dialog.Header, ($$anchor, Dialog_Header) => {
														Dialog_Header($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_1();
																var node_7 = $.first_child(fragment_7);

																$.component(node_7, () => Dialog.Title, ($$anchor, Dialog_Title) => {
																	Dialog_Title($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Share Feedback');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_8 = $.sibling(node_7, 2);

																$.component(node_8, () => Dialog.Description, ($$anchor, Dialog_Description) => {
																	Dialog_Description($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Let us know how we can improve your experience.');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_6, 2);

													$.component(node_9, () => Field.Group, ($$anchor, Field_Group) => {
														Field_Group($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root_2();
																var div_1 = $.first_child(fragment_8);
																var node_10 = $.child(div_1);

																$.component(node_10, () => Field.Field, ($$anchor, Field_Field) => {
																	Field_Field($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = root_1();
																			var node_11 = $.first_child(fragment_9);

																			$.component(node_11, () => Field.Label, ($$anchor, Field_Label) => {
																				Field_Label($$anchor, {
																					for: 'feedback-name',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text('Name');

																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_12 = $.sibling(node_11, 2);

																			Input(node_12, { id: 'feedback-name', placeholder: 'Your name' });
																			$.append($$anchor, fragment_9);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_13 = $.sibling(node_10, 2);

																$.component(node_13, () => Field.Field, ($$anchor, Field_Field_1) => {
																	Field_Field_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root_1();
																			var node_14 = $.first_child(fragment_10);

																			$.component(node_14, () => Field.Label, ($$anchor, Field_Label_1) => {
																				Field_Label_1($$anchor, {
																					for: 'feedback-email',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text('Email');

																						$.append($$anchor, text_5);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_15 = $.sibling(node_14, 2);

																			Input(node_15, {
																				id: 'feedback-email',
																				type: 'email',
																				placeholder: 'you@example.com'
																			});

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.reset(div_1);

																var node_16 = $.sibling(div_1, 2);

																$.component(node_16, () => Field.Field, ($$anchor, Field_Field_2) => {
																	Field_Field_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_11 = root_1();
																			var node_17 = $.first_child(fragment_11);

																			$.component(node_17, () => Field.Label, ($$anchor, Field_Label_2) => {
																				Field_Label_2($$anchor, {
																					for: 'feedback-category',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_6 = $.text('Category');

																						$.append($$anchor, text_6);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_18 = $.sibling(node_17, 2);

																			$.component(node_18, () => Select.Root, ($$anchor, Select_Root) => {
																				Select_Root($$anchor, {
																					type: 'single',
																					get value() {
																						return $.get(categoryValue);
																					},

																					set value($$value) {
																						$.set(categoryValue, $$value, true);
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_12 = root_1();
																						var node_19 = $.first_child(fragment_12);

																						$.component(node_19, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																							Select_Trigger($$anchor, {
																								id: 'feedback-category',
																								class: 'w-full',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_7 = $.text();

																									$.template_effect(() => $.set_text(text_7, $.get(categoryLabel)));
																									$.append($$anchor, text_7);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_20 = $.sibling(node_19, 2);

																						$.component(node_20, () => Select.Content, ($$anchor, Select_Content) => {
																							Select_Content($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_14 = $.comment();
																									var node_21 = $.first_child(fragment_14);

																									$.component(node_21, () => Select.Group, ($$anchor, Select_Group) => {
																										Select_Group($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_15 = $.comment();
																												var node_22 = $.first_child(fragment_15);

																												$.each(node_22, 17, () => categoryItems, (item) => item.value, ($$anchor, item) => {
																													var fragment_16 = $.comment();
																													var node_23 = $.first_child(fragment_16);

																													$.component(node_23, () => Select.Item, ($$anchor, Select_Item) => {
																														Select_Item($$anchor, {
																															get value() {
																																return $.get(item).value;
																															},

																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_8 = $.text();

																																$.template_effect(() => $.set_text(text_8, $.get(item).label));
																																$.append($$anchor, text_8);
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_16);
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

																var node_24 = $.sibling(node_16, 2);

																$.component(node_24, () => Field.Field, ($$anchor, Field_Field_3) => {
																	Field_Field_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_18 = root_1();
																			var node_25 = $.first_child(fragment_18);

																			$.component(node_25, () => Field.Label, ($$anchor, Field_Label_3) => {
																				Field_Label_3($$anchor, {
																					for: 'feedback-message',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_9 = $.text('Message');

																						$.append($$anchor, text_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_26 = $.sibling(node_25, 2);

																			Textarea(node_26, {
																				id: 'feedback-message',
																				placeholder: 'Tell us what\'s on your mind...',
																				class: 'min-h-24 resize-none'
																			});

																			$.append($$anchor, fragment_18);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													var node_27 = $.sibling(node_9, 2);

													$.component(node_27, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
														Dialog_Footer($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_19 = root_1();
																var node_28 = $.first_child(fragment_19);

																{
																	const child = ($$anchor, $$arg0) => {
																		let props = () => ($$arg0?.()).props;

																		Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_10 = $.text('Cancel');

																				$.append($$anchor, text_10);
																			},
																			$$slots: { default: true }
																		}));
																	};

																	$.component(node_28, () => Dialog.Close, ($$anchor, Dialog_Close) => {
																		Dialog_Close($$anchor, { child, $$slots: { child: true } });
																	});
																}

																var node_29 = $.sibling(node_28, 2);

																Button(node_29, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_11 = $.text('Submit');

																		$.append($$anchor, text_11);
																	},
																	$$slots: { default: true }
																});

																$.append($$anchor, fragment_19);
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

							$.append($$anchor, fragment_3);
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