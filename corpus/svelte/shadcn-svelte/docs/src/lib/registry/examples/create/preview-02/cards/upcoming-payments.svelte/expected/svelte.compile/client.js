import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLocalTimeZone, today } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Upcoming_payments($$anchor, $$props) {
	$.push($$props, true);

	let date = $.state($.proxy(today(getLocalTimeZone())));
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

										var text = $.text('Upcoming Payments');

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

										var text_1 = $.text('Select a date to view scheduled payments.');

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
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Item.Root, ($$anchor, Item_Root) => {
								Item_Root($$anchor, {
									variant: 'outline',
									class: 'justify-center',
									children: ($$anchor, $$slotProps) => {
										Calendar($$anchor, {
											type: 'single',
											class: 'w-full [--cell-size:--spacing(8)] md:[--cell-size:--spacing(10)]',
											get value() {
												return $.get(date);
											},

											set value($$value) {
												$.set(date, $$value, true);
											}
										});
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Item.Group, ($$anchor, Item_Group) => {
								Item_Group($$anchor, {
									class: 'w-full',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_7 = $.first_child(fragment_5);

										$.component(node_7, () => Item.Root, ($$anchor, Item_Root_1) => {
											Item_Root_1($$anchor, {
												variant: 'muted',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_8 = $.first_child(fragment_6);

													$.component(node_8, () => Item.Content, ($$anchor, Item_Content) => {
														Item_Content($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root();
																var node_9 = $.first_child(fragment_7);

																$.component(node_9, () => Item.Title, ($$anchor, Item_Title) => {
																	Item_Title($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Netflix Subscription');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => Item.Description, ($$anchor, Item_Description) => {
																	Item_Description($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Apr 15, 2024');

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

													var node_11 = $.sibling(node_8, 2);

													Badge(node_11, {
														variant: 'secondary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('$19.99');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_7, 2);

										$.component(node_12, () => Item.Root, ($$anchor, Item_Root_2) => {
											Item_Root_2($$anchor, {
												variant: 'muted',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root();
													var node_13 = $.first_child(fragment_8);

													$.component(node_13, () => Item.Content, ($$anchor, Item_Content_1) => {
														Item_Content_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root();
																var node_14 = $.first_child(fragment_9);

																$.component(node_14, () => Item.Title, ($$anchor, Item_Title_1) => {
																	Item_Title_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text('Rent Payment');

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_15 = $.sibling(node_14, 2);

																$.component(node_15, () => Item.Description, ($$anchor, Item_Description_1) => {
																	Item_Description_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text('Apr 1, 2024');

																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_13, 2);

													Badge(node_16, {
														variant: 'secondary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('$2,400.00');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_12, 2);

										$.component(node_17, () => Item.Root, ($$anchor, Item_Root_3) => {
											Item_Root_3($$anchor, {
												variant: 'muted',
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root();
													var node_18 = $.first_child(fragment_10);

													$.component(node_18, () => Item.Content, ($$anchor, Item_Content_2) => {
														Item_Content_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_11 = root();
																var node_19 = $.first_child(fragment_11);

																$.component(node_19, () => Item.Title, ($$anchor, Item_Title_2) => {
																	Item_Title_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text('Auto Insurance');

																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_20 = $.sibling(node_19, 2);

																$.component(node_20, () => Item.Description, ($$anchor, Item_Description_2) => {
																	Item_Description_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_9 = $.text('Apr 22, 2024');

																			$.append($$anchor, text_9);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_11);
															},
															$$slots: { default: true }
														});
													});

													var node_21 = $.sibling(node_18, 2);

													Badge(node_21, {
														variant: 'secondary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('$186.00');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
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