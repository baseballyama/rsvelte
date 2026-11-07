import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from "$lib/registry/ui/breadcrumb/index.js";

import { Card, CardContent, CardHeader } from "$lib/registry/ui/card/index.js";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "$lib/registry/ui/dropdown-menu/index.js";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle
} from "$lib/registry/ui/item/index.js";

var root = $.from_html(`<!> <span class="sr-only">Account options</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<div role="listitem" class="w-full"><!></div> <div role="listitem" class="w-full"><!></div> <div role="listitem" class="w-full"><!></div>`, 1);

export default function Payments($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				class: 'flex flex-col gap-3',
				children: ($$anchor, $$slotProps) => {
					Breadcrumb($$anchor, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbList($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_3();
									var node_1 = $.first_child(fragment_4);

									BreadcrumbItem(node_1, {
										children: ($$anchor, $$slotProps) => {
											BreadcrumbLink($$anchor, {
												href: '/',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Home');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_2 = $.sibling(node_1, 2);

									BreadcrumbSeparator(node_2, {});

									var node_3 = $.sibling(node_2, 2);

									BreadcrumbItem(node_3, {
										children: ($$anchor, $$slotProps) => {
											DropdownMenu($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_2();
													var node_4 = $.first_child(fragment_7);

													DropdownMenuTrigger(node_4, {
														class: 'cn-button cn-button-variant-ghost cn-button-size-icon-sm',
														'aria-label': 'Account options',
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root();
															var node_5 = $.first_child(fragment_8);

															IconPlaceholder(node_5, {
																lucide: 'MoreHorizontalIcon',
																tabler: 'IconDots',
																hugeicons: 'MoreHorizontalCircle01Icon',
																phosphor: 'DotsThreeIcon',
																remixicon: 'RiMoreLine'
															});

															$.next(2);
															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});

													var node_6 = $.sibling(node_4, 2);

													DropdownMenuContent(node_6, {
														align: 'start',
														portalProps: { disabled: true },
														children: ($$anchor, $$slotProps) => {
															DropdownMenuGroup($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_10 = root_1();
																	var node_7 = $.first_child(fragment_10);

																	DropdownMenuItem(node_7, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('Profile');

																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});

																	var node_8 = $.sibling(node_7, 2);

																	DropdownMenuItem(node_8, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Statements');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});

																	var node_9 = $.sibling(node_8, 2);

																	DropdownMenuItem(node_9, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Documents');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});

																	$.append($$anchor, fragment_10);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_3, 2);

									BreadcrumbSeparator(node_10, {});

									var node_11 = $.sibling(node_10, 2);

									BreadcrumbItem(node_11, {
										children: ($$anchor, $$slotProps) => {
											BreadcrumbPage($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Payments');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node, 2);

			CardContent(node_12, {
				children: ($$anchor, $$slotProps) => {
					ItemGroup($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_4();
							var div = $.first_child(fragment_13);
							var node_13 = $.child(div);

							Item(node_13, {
								variant: 'muted',
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_1();
									var node_14 = $.first_child(fragment_14);

									ItemMedia(node_14, {
										variant: 'icon',
										children: ($$anchor, $$slotProps) => {
											IconPlaceholder($$anchor, {
												lucide: 'SettingsIcon',
												tabler: 'IconSettings',
												hugeicons: 'Settings01Icon',
												phosphor: 'GearIcon',
												remixicon: 'RiSettingsLine'
											});
										},
										$$slots: { default: true }
									});

									var node_15 = $.sibling(node_14, 2);

									ItemContent(node_15, {
										children: ($$anchor, $$slotProps) => {
											var fragment_16 = root_2();
											var node_16 = $.first_child(fragment_16);

											ItemTitle(node_16, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Change transfer limit');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});

											var node_17 = $.sibling(node_16, 2);

											ItemDescription(node_17, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Adjust how much you can send from your balance.');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_16);
										},
										$$slots: { default: true }
									});

									var node_18 = $.sibling(node_15, 2);

									IconPlaceholder(node_18, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine',
										class: 'size-4 shrink-0 text-muted-foreground'
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});

							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var node_19 = $.child(div_1);

							Item(node_19, {
								variant: 'muted',
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root_1();
									var node_20 = $.first_child(fragment_17);

									ItemMedia(node_20, {
										variant: 'icon',
										children: ($$anchor, $$slotProps) => {
											IconPlaceholder($$anchor, {
												lucide: 'CalendarIcon',
												tabler: 'IconCalendar',
												hugeicons: 'Calendar03Icon',
												phosphor: 'CalendarIcon',
												remixicon: 'RiCalendarLine'
											});
										},
										$$slots: { default: true }
									});

									var node_21 = $.sibling(node_20, 2);

									ItemContent(node_21, {
										children: ($$anchor, $$slotProps) => {
											var fragment_19 = root_2();
											var node_22 = $.first_child(fragment_19);

											ItemTitle(node_22, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Scheduled transfers');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});

											var node_23 = $.sibling(node_22, 2);

											ItemDescription(node_23, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Set up a transfer to send at a later date.');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_19);
										},
										$$slots: { default: true }
									});

									var node_24 = $.sibling(node_21, 2);

									IconPlaceholder(node_24, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine',
										class: 'size-4 shrink-0 text-muted-foreground'
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});

							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_25 = $.child(div_2);

							Item(node_25, {
								variant: 'muted',
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root_1();
									var node_26 = $.first_child(fragment_20);

									ItemMedia(node_26, {
										variant: 'icon',
										children: ($$anchor, $$slotProps) => {
											IconPlaceholder($$anchor, {
												lucide: 'RefreshCwIcon',
												tabler: 'IconRefresh',
												hugeicons: 'RefreshIcon',
												phosphor: 'ArrowsClockwiseIcon',
												remixicon: 'RiRefreshLine'
											});
										},
										$$slots: { default: true }
									});

									var node_27 = $.sibling(node_26, 2);

									ItemContent(node_27, {
										children: ($$anchor, $$slotProps) => {
											var fragment_22 = root_2();
											var node_28 = $.first_child(fragment_22);

											ItemTitle(node_28, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('Recurring card payments');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});

											var node_29 = $.sibling(node_28, 2);

											ItemDescription(node_29, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('Manage your repeated card transactions.');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_22);
										},
										$$slots: { default: true }
									});

									var node_30 = $.sibling(node_27, 2);

									IconPlaceholder(node_30, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine',
										class: 'size-4 shrink-0 text-muted-foreground'
									});

									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});

							$.reset(div_2);
							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}