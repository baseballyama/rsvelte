import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { onMount } from 'svelte';
import { CardGrid, PaginationInline } from '$lib/components';
import { Button } from '$lib/elements/forms';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { formatCurrency } from '$lib/helpers/numbers';
import { getApiEndpoint, sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { trackEvent } from '$lib/actions/analytics';
import { selectedInvoice, showRetryModal } from './store';
import { impersonatedResourceUrl } from '$lib/appwrite/impersonation';

import {
	ActionMenu,
	Badge,
	Card,
	Empty,
	Icon,
	Layout,
	Link,
	Popover,
	Skeleton,
	Table
} from '@appwrite.io/pink-svelte';

import {
	IconDotsHorizontal,
	IconDownload,
	IconExternalLink,
	IconRefresh
} from '@appwrite.io/pink-icons-svelte';

import { addNotification } from '$lib/stores/notifications';

export default function PaymentHistory($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let limit = 5;
		let offset = 0;
		let isLoadingInvoices = false;
		let invoiceList = { invoices: [], total: 0 };
		const endpoint = getApiEndpoint();
		const hasPaymentError = $.derived(() => invoiceList?.invoices.some((invoice) => invoice?.lastError));

		onMount(loadInvoices);

		async function loadInvoices() {
			isLoadingInvoices = true;

			try {
				invoiceList = await sdk.forConsole.organizations.listInvoices({
					organizationId: page.params.organization,
					queries: [
						Query.orderDesc('$createdAt'),
						Query.limit(limit),
						Query.offset(offset)
					]
				});
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
			} finally {
				isLoadingInvoices = false;
			}
		}

		function retryPayment(invoice) {
			$.store_set(selectedInvoice, invoice);
			$.store_set(showRetryModal, true);
		}

		function invoiceUrl(invoiceId, action) {
			return $.store_get($$store_subs ??= {}, '$impersonatedResourceUrl', impersonatedResourceUrl)(`${endpoint}/organizations/${page.params.organization}/invoices/${invoiceId}/${action}`);
		}

		const columns = $.derived(() => [
			{ id: 'dueDate', width: { min: 120 } },
			{ id: 'status', width: { min: hasPaymentError() ? 200 : 100 } },
			{ id: 'amount', width: { min: 120 } },
			{ id: 'actions', width: 40 }
		]);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				overflow: false,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Transaction history for this organization. Download invoices for more details about your payments.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Payment history`);
						}
					},

					aside: ($$renderer) => {
						{
							if (invoiceList.total > 0 || isLoadingInvoices) {
								$$renderer.push('<!--[0-->');

								if (Table.Root) {
									$$renderer.push('<!--[-->');

									Table.Root($$renderer, {
										columns: columns(),
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$renderer, { root }) => {
												if (isLoadingInvoices) {
													$$renderer.push(`<!--[0--><!--[-->`);

													const each_array = $.ensure_array_like(Array.from({ length: 5 }).keys());

													for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
														let index = each_array[$$index_1];

														if (Table.Row.Base) {
															$$renderer.push('<!--[-->');

															Table.Row.Base($$renderer, {
																root,
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array_1 = $.ensure_array_like(columns());

																	for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																		let column = each_array_1[$$index];

																		if (Table.Cell) {
																			$$renderer.push('<!--[-->');

																			Table.Cell($$renderer, {
																				column: column.id,
																				root,
																				children: ($$renderer) => {
																					Skeleton($$renderer, { variant: 'line', height: 20, width: '100%' });
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(`<!--]-->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(`<!--]-->`);
												} else {
													$$renderer.push(`<!--[-1--><!--[-->`);

													const each_array_2 = $.ensure_array_like(invoiceList?.invoices);

													for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
														let invoice = each_array_2[$$index_2];
														const status = invoice.status;

														if (Table.Row.Base) {
															$$renderer.push('<!--[-->');

															Table.Row.Base($$renderer, {
																root,
																children: ($$renderer) => {
																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			column: 'dueDate',
																			root,
																			children: ($$renderer) => {
																				DualTimeView($$renderer, { time: invoice.dueAt });
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			column: 'status',
																			root,
																			children: ($$renderer) => {
																				const isDanger = status === 'overdue' || status === 'failed' || status === 'requires_authentication';
																				const isSuccess = status === 'paid' || status === 'succeeded';
																				const isWarning = status === 'pending';

																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						direction: 'row',
																						gap: 's',
																						children: ($$renderer) => {
																							Badge($$renderer, {
																								variant: 'secondary',
																								content: status === 'requires_authentication' ? 'failed' : status,
																								type: isDanger
																									? 'error'
																									: isWarning ? 'warning' : isSuccess ? 'success' : undefined
																							});

																							$$renderer.push(`<!----> `);

																							if (invoice?.lastError) {
																								$$renderer.push('<!--[0-->');

																								Popover($$renderer, {
																									children: $.invalid_default_snippet,
																									$$slots: {
																										default: ($$renderer, { toggle }) => {
																											if (Link.Button) {
																												$$renderer.push('<!--[-->');

																												Link.Button($$renderer, {
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Details`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										},

																										tooltip: ($$renderer) => {
																											{
																												$$renderer.push(`The scheduled payment has failed. `);

																												if (Link.Button) {
																													$$renderer.push('<!--[-->');

																													Link.Button($$renderer, {
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->Try again`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}
																											}
																										}
																									}
																								});
																							} else {
																								$$renderer.push('<!--[-1-->');
																							}

																							$$renderer.push(`<!--]-->`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			column: 'amount',
																			root,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(formatCurrency(invoice.grossAmount))}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			column: 'actions',
																			root,
																			children: ($$renderer) => {
																				Popover($$renderer, {
																					placement: 'bottom-start',
																					padding: 'none',
																					children: $.invalid_default_snippet,
																					$$slots: {
																						default: ($$renderer, { toggle }) => {
																							Button($$renderer, {
																								text: true,
																								icon: true,
																								ariaLabel: 'more options',
																								children: ($$renderer) => {
																									Icon($$renderer, { icon: IconDotsHorizontal, size: 's' });
																								},
																								$$slots: { default: true }
																							});
																						},

																						tooltip: ($$renderer) => {
																							if (ActionMenu.Root) {
																								$$renderer.push('<!--[-->');

																								ActionMenu.Root($$renderer, {
																									slot: 'tooltip',
																									children: ($$renderer) => {
																										if (ActionMenu.Item.Anchor) {
																											$$renderer.push('<!--[-->');

																											ActionMenu.Item.Anchor($$renderer, {
																												leadingIcon: IconExternalLink,
																												external: true,
																												href: invoiceUrl(invoice.$id, 'view'),
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->View invoice`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (ActionMenu.Item.Anchor) {
																											$$renderer.push('<!--[-->');

																											ActionMenu.Item.Anchor($$renderer, {
																												leadingIcon: IconDownload,
																												href: invoiceUrl(invoice.$id, 'download'),
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Download PDF`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (status === 'overdue' || status === 'failed' || status === 'abandoned') {
																											$$renderer.push('<!--[0-->');

																											if (ActionMenu.Item.Button) {
																												$$renderer.push('<!--[-->');

																												ActionMenu.Item.Button($$renderer, {
																													leadingIcon: IconRefresh,
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Retry payment`);
																													},
																													$$slots: { default: true }
																												});

																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}
																										} else {
																											$$renderer.push('<!--[-1-->');
																										}

																										$$renderer.push(`<!--]-->`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}
																						}
																					}
																				});
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(`<!--]-->`);
												}

												$$renderer.push(`<!--]-->`);
											},

											header: ($$renderer, { root }) => {
												{
													if (Table.Header.Cell) {
														$$renderer.push('<!--[-->');

														Table.Header.Cell($$renderer, {
															column: 'dueDate',
															root,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Due date`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Header.Cell) {
														$$renderer.push('<!--[-->');

														Table.Header.Cell($$renderer, {
															column: 'status',
															root,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Status`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Header.Cell) {
														$$renderer.push('<!--[-->');

														Table.Header.Cell($$renderer, {
															column: 'amount',
															root,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Amount due`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Table.Header.Cell) {
														$$renderer.push('<!--[-->');
														Table.Header.Cell($$renderer, { column: 'actions', root });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}
											}
										}
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (invoiceList.total >= limit) {
									$$renderer.push('<!--[0-->');

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
											children: ($$renderer) => {
												$$renderer.push(`<p class="text">Total results: ${$.escape(invoiceList.total)}</p> `);

												PaginationInline($$renderer, {
													limit,
													hidePages: true,
													total: invoiceList.total,
													get offset() {
														return offset;
													},

													set offset($$value) {
														offset = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push('<!--[-1-->');

								if (Card.Base) {
									$$renderer.push('<!--[-->');

									Card.Base($$renderer, {
										children: ($$renderer) => {
											Empty($$renderer, {
												type: 'secondary',
												title: 'You have no payment history.',
												description: 'After you receive your first invoice, you\'ll see it here.'
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}