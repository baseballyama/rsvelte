import * as $ from 'svelte/internal/server';
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

export default function Payments($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				class: 'flex flex-col gap-3',
				children: ($$renderer) => {
					Breadcrumb($$renderer, {
						children: ($$renderer) => {
							BreadcrumbList($$renderer, {
								children: ($$renderer) => {
									BreadcrumbItem($$renderer, {
										children: ($$renderer) => {
											BreadcrumbLink($$renderer, {
												href: '/',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Home`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);
									BreadcrumbSeparator($$renderer, {});
									$$renderer.push(`<!----> `);

									BreadcrumbItem($$renderer, {
										children: ($$renderer) => {
											DropdownMenu($$renderer, {
												children: ($$renderer) => {
													DropdownMenuTrigger($$renderer, {
														class: 'cn-button cn-button-variant-ghost cn-button-size-icon-sm',
														'aria-label': 'Account options',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'MoreHorizontalIcon',
																tabler: 'IconDots',
																hugeicons: 'MoreHorizontalCircle01Icon',
																phosphor: 'DotsThreeIcon',
																remixicon: 'RiMoreLine'
															});

															$$renderer.push(`<!----> <span class="sr-only">Account options</span>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													DropdownMenuContent($$renderer, {
														align: 'start',
														portalProps: { disabled: true },
														children: ($$renderer) => {
															DropdownMenuGroup($$renderer, {
																children: ($$renderer) => {
																	DropdownMenuItem($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Profile`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	DropdownMenuItem($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Statements`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	DropdownMenuItem($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Documents`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!---->`);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);
									BreadcrumbSeparator($$renderer, {});
									$$renderer.push(`<!----> `);

									BreadcrumbItem($$renderer, {
										children: ($$renderer) => {
											BreadcrumbPage($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Payments`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					ItemGroup($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div role="listitem" class="w-full">`);

							Item($$renderer, {
								variant: 'muted',
								children: ($$renderer) => {
									ItemMedia($$renderer, {
										variant: 'icon',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'SettingsIcon',
												tabler: 'IconSettings',
												hugeicons: 'Settings01Icon',
												phosphor: 'GearIcon',
												remixicon: 'RiSettingsLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ItemContent($$renderer, {
										children: ($$renderer) => {
											ItemTitle($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Change transfer limit`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											ItemDescription($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Adjust how much you can send from your balance.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									IconPlaceholder($$renderer, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine',
										class: 'size-4 shrink-0 text-muted-foreground'
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div> <div role="listitem" class="w-full">`);

							Item($$renderer, {
								variant: 'muted',
								children: ($$renderer) => {
									ItemMedia($$renderer, {
										variant: 'icon',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'CalendarIcon',
												tabler: 'IconCalendar',
												hugeicons: 'Calendar03Icon',
												phosphor: 'CalendarIcon',
												remixicon: 'RiCalendarLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ItemContent($$renderer, {
										children: ($$renderer) => {
											ItemTitle($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Scheduled transfers`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											ItemDescription($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Set up a transfer to send at a later date.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									IconPlaceholder($$renderer, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine',
										class: 'size-4 shrink-0 text-muted-foreground'
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div> <div role="listitem" class="w-full">`);

							Item($$renderer, {
								variant: 'muted',
								children: ($$renderer) => {
									ItemMedia($$renderer, {
										variant: 'icon',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'RefreshCwIcon',
												tabler: 'IconRefresh',
												hugeicons: 'RefreshIcon',
												phosphor: 'ArrowsClockwiseIcon',
												remixicon: 'RiRefreshLine'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ItemContent($$renderer, {
										children: ($$renderer) => {
											ItemTitle($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Recurring card payments`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											ItemDescription($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Manage your repeated card transactions.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									IconPlaceholder($$renderer, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine',
										class: 'size-4 shrink-0 text-muted-foreground'
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}