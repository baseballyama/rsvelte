import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="text-3xl font-semibold tabular-nums">$420,000</span> <!>`, 1);
var root_2 = $.from_html(`<span class="text-sm text-muted-foreground">65% achieved</span> <span class="text-sm font-medium tabular-nums">$273,000</span>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <span class="text-3xl font-semibold tabular-nums">$85,000</span> <!>`, 1);
var root_5 = $.from_html(`<span class="text-sm text-muted-foreground">32% achieved</span> <span class="text-sm font-medium tabular-nums">$27,200</span>`, 1);
var root_6 = $.from_html(`<!> <!> <div class="flex flex-col gap-2"><div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Estimated Shares</span> <span class="text-sm font-semibold tabular-nums">1.95</span></div> <div class="flex items-center justify-between"><span class="text-sm text-muted-foreground">Buying Power</span> <span class="text-sm font-semibold tabular-nums">$12,450.00</span></div></div>`, 1);
var root_7 = $.from_html(`<div class="grid grid-cols-2 gap-(--gap)"><!> <!></div>`);

export default function Savings_targets($$anchor) {
	var div = root_7();
	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Savings Targets');

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

										var text_1 = $.text('Active milestones for 2024');

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
											variant: 'outline',
											size: 'sm',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('New Goal');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_6 = $.first_child(fragment_3);

							$.component(node_6, () => Item.Group, ($$anchor, Item_Group) => {
								Item_Group($$anchor, {
									class: 'gap-3',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_3();
										var node_7 = $.first_child(fragment_4);

										$.component(node_7, () => Item.Root, ($$anchor, Item_Root) => {
											Item_Root($$anchor, {
												variant: 'muted',
												class: 'flex-col items-stretch',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_3();
													var node_8 = $.first_child(fragment_5);

													$.component(node_8, () => Item.Content, ($$anchor, Item_Content) => {
														Item_Content($$anchor, {
															class: 'gap-3',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root_1();
																var node_9 = $.first_child(fragment_6);

																$.component(node_9, () => Item.Description, ($$anchor, Item_Description) => {
																	Item_Description($$anchor, {
																		class: 'cn-font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Retirement');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_9, 4);

																Progress(node_10, { value: 65 });
																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_8, 2);

													$.component(node_11, () => Item.Footer, ($$anchor, Item_Footer) => {
														Item_Footer($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_2();

																$.next(2);
																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_7, 2);

										$.component(node_12, () => Item.Root, ($$anchor, Item_Root_1) => {
											Item_Root_1($$anchor, {
												variant: 'muted',
												class: 'flex-col items-stretch',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_3();
													var node_13 = $.first_child(fragment_8);

													$.component(node_13, () => Item.Content, ($$anchor, Item_Content_1) => {
														Item_Content_1($$anchor, {
															class: 'gap-3',
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root_4();
																var node_14 = $.first_child(fragment_9);

																$.component(node_14, () => Item.Description, ($$anchor, Item_Description_1) => {
																	Item_Description_1($$anchor, {
																		class: 'cn-font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('Real Estate');

																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_15 = $.sibling(node_14, 4);

																Progress(node_15, { value: 32 });
																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_13, 2);

													$.component(node_16, () => Item.Footer, ($$anchor, Item_Footer_1) => {
														Item_Footer_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root_5();

																$.next(2);
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

				var node_17 = $.sibling(node_5, 2);

				$.component(node_17, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = $.comment();
							var node_18 = $.first_child(fragment_11);

							$.component(node_18, () => Card.Description, ($$anchor, Card_Description_1) => {
								Card_Description_1($$anchor, {
									class: 'text-center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('You have not met your targets for this year.');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_19 = $.sibling(node, 2);

	$.component(node_19, () => Card.Root, ($$anchor, Card_Root_1) => {
		Card_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_12 = root();
				var node_20 = $.first_child(fragment_12);

				$.component(node_20, () => Card.Header, ($$anchor, Card_Header_1) => {
					Card_Header_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = $.comment();
							var node_21 = $.first_child(fragment_13);

							$.component(node_21, () => Card.Title, ($$anchor, Card_Title_1) => {
								Card_Title_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Buy Investment');

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

				var node_22 = $.sibling(node_20, 2);

				$.component(node_22, () => Card.Content, ($$anchor, Card_Content_1) => {
					Card_Content_1($$anchor, {
						class: 'flex flex-1 flex-col gap-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = $.comment();
							var node_23 = $.first_child(fragment_14);

							$.component(node_23, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									class: 'flex-1',
									children: ($$anchor, $$slotProps) => {
										var fragment_15 = root_6();
										var node_24 = $.first_child(fragment_15);

										$.component(node_24, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_16 = root_3();
													var node_25 = $.first_child(fragment_16);

													$.component(node_25, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'invest-amount',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Amount to Invest');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_26 = $.sibling(node_25, 2);

													$.component(node_26, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
														InputGroup_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = root_3();
																var node_27 = $.first_child(fragment_17);

																$.component(node_27, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																	InputGroup_Addon($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_18 = $.comment();
																			var node_28 = $.first_child(fragment_18);

																			$.component(node_28, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
																				InputGroup_Text($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_8 = $.text('$');

																						$.append($$anchor, text_8);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_18);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_29 = $.sibling(node_27, 2);

																$.component(node_29, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																	InputGroup_Input($$anchor, { id: 'invest-amount', value: '1,000.00' });
																});

																$.append($$anchor, fragment_17);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_16);
												},
												$$slots: { default: true }
											});
										});

										var node_30 = $.sibling(node_24, 2);

										$.component(node_30, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_19 = root();
													var node_31 = $.first_child(fragment_19);

													$.component(node_31, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'invest-type',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_9 = $.text('Order Type');

																$.append($$anchor, text_9);
															},
															$$slots: { default: true }
														});
													});

													var node_32 = $.sibling(node_31, 2);

													$.component(node_32, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
														NativeSelect_Root($$anchor, {
															id: 'invest-type',
															value: 'market',
															children: ($$anchor, $$slotProps) => {
																var fragment_20 = root();
																var node_33 = $.first_child(fragment_20);

																$.component(node_33, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
																	NativeSelect_Option($$anchor, {
																		value: 'market',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_10 = $.text('Market Order');

																			$.append($$anchor, text_10);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_34 = $.sibling(node_33, 2);

																$.component(node_34, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
																	NativeSelect_Option_1($$anchor, {
																		value: 'limit',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_11 = $.text('Limit Order');

																			$.append($$anchor, text_11);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_35 = $.sibling(node_34, 2);

																$.component(node_35, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
																	NativeSelect_Option_2($$anchor, {
																		value: 'stop',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_12 = $.text('Stop Order');

																			$.append($$anchor, text_12);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_20);
															},
															$$slots: { default: true }
														});
													});

													var node_36 = $.sibling(node_32, 2);

													$.component(node_36, () => Field.Description, ($$anchor, Field_Description) => {
														Field_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_13 = $.text('Market orders execute at the current price.');

																$.append($$anchor, text_13);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_19);
												},
												$$slots: { default: true }
											});
										});

										$.next(2);
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

				var node_37 = $.sibling(node_22, 2);

				$.component(node_37, () => Card.Footer, ($$anchor, Card_Footer_1) => {
					Card_Footer_1($$anchor, {
						class: 'flex-col gap-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_21 = root_3();
							var node_38 = $.first_child(fragment_21);

							Button(node_38, {
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('Review Order');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							var node_39 = $.sibling(node_38, 2);

							$.component(node_39, () => Card.Description, ($$anchor, Card_Description_2) => {
								Card_Description_2($$anchor, {
									class: 'text-center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_15 = $.text('Trades are typically executed within minutes during market hours.');

										$.append($$anchor, text_15);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_21);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_12);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}