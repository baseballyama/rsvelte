import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">More options</span>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Billing_list($$anchor, $$props) {
	$.push($$props, true);

	const billingItems = [
		{
			month: "November 2025",
			invoiceDate: new CalendarDate(2025, 11, 5),
			amount: "$10.00",
			status: "Paid"
		},

		{
			month: "October 2025",
			invoiceDate: new CalendarDate(2025, 10, 4),
			amount: "$10.00",
			status: "Paid"
		},

		{
			month: "September 2025",
			invoiceDate: new CalendarDate(2025, 9, 4),
			amount: "$10.00",
			status: "Paid"
		}
	];

	const dateFormatter = new DateFormatter("en-US", { day: "numeric", month: "short", year: "numeric" });

	Example($$anchor, {
		title: 'Billing',
		class: 'items-center lg:p-16',
		containerClass: 'col-span-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Item.Group, ($$anchor, Item_Group) => {
				Item_Group($$anchor, {
					class: 'max-w-7xl gap-0 rounded-lg border',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.each(node_1, 19, () => billingItems, (item) => item.month, ($$anchor, item, index) => {
							var fragment_3 = root_1();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Item.Root, ($$anchor, Item_Root) => {
								Item_Root($$anchor, {
									class: 'grid grid-cols-[1fr_auto] lg:grid-cols-[2fr_1fr_1fr_auto]',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_4();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Item.Content, ($$anchor, Item_Content) => {
											Item_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var node_4 = $.first_child(fragment_5);

													$.component(node_4, () => Item.Title, ($$anchor, Item_Title) => {
														Item_Title($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_6 = root();
																var text = $.first_child(fragment_6);
																var node_5 = $.sibling(text);

																Badge(node_5, {
																	variant: 'secondary',
																	class: 'bg-green-100 text-green-700 hover:bg-green-100',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text();

																		$.template_effect(() => $.set_text(text_1, $.get(item).status));
																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});

																$.template_effect(() => $.set_text(text, `${$.get(item).month ?? ''} `));
																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_4, 2);

													$.component(node_6, () => Item.Description, ($$anchor, Item_Description) => {
														Item_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Infrastructure usage & Vercel platform');

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

										var node_7 = $.sibling(node_3, 2);

										$.component(node_7, () => Item.Content, ($$anchor, Item_Content_1) => {
											Item_Content_1($$anchor, {
												class: 'hidden lg:flex',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_1();
													var node_8 = $.first_child(fragment_8);

													$.component(node_8, () => Item.Title, ($$anchor, Item_Title_1) => {
														Item_Title_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Total Due');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Item.Description, ($$anchor, Item_Description_1) => {
														Item_Description_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text();

																$.template_effect(() => $.set_text(text_4, $.get(item).amount));
																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_7, 2);

										$.component(node_10, () => Item.Content, ($$anchor, Item_Content_2) => {
											Item_Content_2($$anchor, {
												class: 'hidden lg:flex',
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = $.comment();
													var node_11 = $.first_child(fragment_10);

													$.component(node_11, () => Item.Description, ($$anchor, Item_Description_2) => {
														Item_Description_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text();

																$.template_effect(($0) => $.set_text(text_5, `Invoiced ${$0 ?? ''}`), [
																	() => dateFormatter.format($.get(item).invoiceDate.toDate(getLocalTimeZone()))
																]);

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_10, 2);

										$.component(node_12, () => Item.Actions, ($$anchor, Item_Actions) => {
											Item_Actions($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_12 = $.comment();
													var node_13 = $.first_child(fragment_12);

													$.component(node_13, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
														DropdownMenu_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = root_1();
																var node_14 = $.first_child(fragment_13);

																{
																	const child = ($$anchor, $$arg0) => {
																		let props = () => ($$arg0?.()).props;

																		Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon' }, props, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_15 = root_2();
																				var node_15 = $.first_child(fragment_15);

																				IconPlaceholder(node_15, {
																					lucide: 'MoreHorizontalIcon',
																					tabler: 'IconDots',
																					hugeicons: 'MoreHorizontalCircle01Icon',
																					phosphor: 'DotsThreeOutlineIcon',
																					remixicon: 'RiMoreLine'
																				});

																				$.next(2);
																				$.append($$anchor, fragment_15);
																			},
																			$$slots: { default: true }
																		}));
																	};

																	$.component(node_14, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																		DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
																	});
																}

																var node_16 = $.sibling(node_14, 2);

																$.component(node_16, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
																	DropdownMenu_Content($$anchor, {
																		align: 'end',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_16 = root_3();
																			var node_17 = $.first_child(fragment_16);

																			$.component(node_17, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																				DropdownMenu_Item($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_6 = $.text('View invoice');

																						$.append($$anchor, text_6);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_18 = $.sibling(node_17, 2);

																			$.component(node_18, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																				DropdownMenu_Item_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_7 = $.text('Download PDF');

																						$.append($$anchor, text_7);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_19 = $.sibling(node_18, 2);

																			$.component(node_19, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																				DropdownMenu_Separator($$anchor, {});
																			});

																			var node_20 = $.sibling(node_19, 2);

																			$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																				DropdownMenu_Item_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_8 = $.text('Contact support');

																						$.append($$anchor, text_8);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_16);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_12, 2);

										$.component(node_21, () => Item.Footer, ($$anchor, Item_Footer) => {
											Item_Footer($$anchor, {
												class: 'col-span-full w-full border-t pt-4 lg:hidden',
												children: ($$anchor, $$slotProps) => {
													var fragment_17 = root_1();
													var node_22 = $.first_child(fragment_17);

													$.component(node_22, () => Item.Content, ($$anchor, Item_Content_3) => {
														Item_Content_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_18 = root_1();
																var node_23 = $.first_child(fragment_18);

																$.component(node_23, () => Item.Title, ($$anchor, Item_Title_2) => {
																	Item_Title_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_9 = $.text('Total Due');

																			$.append($$anchor, text_9);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_24 = $.sibling(node_23, 2);

																$.component(node_24, () => Item.Description, ($$anchor, Item_Description_3) => {
																	Item_Description_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_10 = $.text();

																			$.template_effect(() => $.set_text(text_10, $.get(item).amount));
																			$.append($$anchor, text_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_18);
															},
															$$slots: { default: true }
														});
													});

													var node_25 = $.sibling(node_22, 2);

													$.component(node_25, () => Item.Content, ($$anchor, Item_Content_4) => {
														Item_Content_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_20 = $.comment();
																var node_26 = $.first_child(fragment_20);

																$.component(node_26, () => Item.Description, ($$anchor, Item_Description_4) => {
																	Item_Description_4($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_11 = $.text();

																			$.template_effect(($0) => $.set_text(text_11, `Invoiced ${$0 ?? ''}`), [
																				() => dateFormatter.format($.get(item).invoiceDate.toDate(getLocalTimeZone()))
																			]);

																			$.append($$anchor, text_11);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_20);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_27 = $.sibling(node_2, 2);

							{
								var consequent = ($$anchor) => {
									var fragment_22 = $.comment();
									var node_28 = $.first_child(fragment_22);

									$.component(node_28, () => Item.Separator, ($$anchor, Item_Separator) => {
										Item_Separator($$anchor, { class: 'my-0' });
									});

									$.append($$anchor, fragment_22);
								};

								$.if(node_27, ($$render) => {
									if ($.get(index) !== billingItems.length - 1) $$render(consequent);
								});
							}

							$.append($$anchor, fragment_3);
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