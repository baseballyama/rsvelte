import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`The scheduled payment has failed. <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<p class="text"> </p> <!>`, 1);

export default function PaymentHistory($$anchor, $$props) {
	$.push($$props, true);

	const $selectedInvoice = () => $.store_get(selectedInvoice, '$selectedInvoice', $$stores);
	const $showRetryModal = () => $.store_get(showRetryModal, '$showRetryModal', $$stores);
	const $impersonatedResourceUrl = () => $.store_get(impersonatedResourceUrl, '$impersonatedResourceUrl', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let limit = 5;
	let offset = $.state(0);
	let isLoadingInvoices = $.state(false);
	let invoiceList = $.state($.proxy({ invoices: [], total: 0 }));
	const endpoint = getApiEndpoint();
	const hasPaymentError = $.derived(() => $.get(invoiceList)?.invoices.some((invoice) => invoice?.lastError));

	onMount(loadInvoices);

	async function loadInvoices() {
		$.set(isLoadingInvoices, true);

		try {
			$.set(
				invoiceList,
				await sdk.forConsole.organizations.listInvoices({
					organizationId: page.params.organization,
					queries: [
						Query.orderDesc('$createdAt'),
						Query.limit(limit),
						Query.offset($.get(offset))
					]
				}),
				true
			);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
		} finally {
			$.set(isLoadingInvoices, false);
		}
	}

	function retryPayment(invoice) {
		$.store_set(selectedInvoice, invoice);
		$.store_set(showRetryModal, true);
	}

	function invoiceUrl(invoiceId, action) {
		return $impersonatedResourceUrl()(`${endpoint}/organizations/${page.params.organization}/invoices/${invoiceId}/${action}`);
	}

	$.user_effect(() => {
		if (page.url.searchParams.get('type') === 'validate-invoice') {
			window.history.replaceState({}, '', page.url.pathname);
			loadInvoices();
		}
	});

	const columns = $.derived(() => [
		{ id: 'dueDate', width: { min: 120 } },
		{
			id: 'status',
			width: { min: $.get(hasPaymentError) ? 200 : 100 }
		},
		{ id: 'amount', width: { min: 120 } },
		{ id: 'actions', width: 40 }
	]);

	CardGrid($$anchor, {
		overflow: false,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Transaction history for this organization. Download invoices for more details about your payments.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Payment history');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent_4 = ($$anchor) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Table.Root, ($$anchor, Table_Root) => {
							Table_Root($$anchor, {
								get columns() {
									return $.get(columns);
								},
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$anchor, $$slotProps) => {
										const root = $.derived(() => $$slotProps.root);
										var fragment_3 = $.comment();
										var node_2 = $.first_child(fragment_3);

										{
											var consequent = ($$anchor) => {
												var fragment_4 = $.comment();
												var node_3 = $.first_child(fragment_4);

												$.each(node_3, 16, () => Array.from({ length: 5 }).keys(), (index) => index, ($$anchor, index) => {
													var fragment_5 = $.comment();
													var node_4 = $.first_child(fragment_5);

													$.component(node_4, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
														Table_Row_Base($$anchor, {
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_5 = $.first_child(fragment_6);

																$.each(node_5, 17, () => $.get(columns), $.index, ($$anchor, column) => {
																	var fragment_7 = $.comment();
																	var node_6 = $.first_child(fragment_7);

																	$.component(node_6, () => Table.Cell, ($$anchor, Table_Cell) => {
																		Table_Cell($$anchor, {
																			get column() {
																				return $.get(column).id;
																			},

																			get root() {
																				return $.get(root);
																			},

																			children: ($$anchor, $$slotProps) => {
																				Skeleton($$anchor, { variant: 'line', height: 20, width: '100%' });
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_7);
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												});

												$.append($$anchor, fragment_4);
											};

											var alternate = ($$anchor) => {
												var fragment_9 = $.comment();
												var node_7 = $.first_child(fragment_9);

												$.each(node_7, 17, () => $.get(invoiceList)?.invoices, (invoice) => invoice.$id, ($$anchor, invoice) => {
													const status = $.derived(() => $.get(invoice).status);
													var fragment_10 = $.comment();
													var node_8 = $.first_child(fragment_10);

													$.component(node_8, () => Table.Row.Base, ($$anchor, Table_Row_Base_1) => {
														Table_Row_Base_1($$anchor, {
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_11 = root_4();
																var node_9 = $.first_child(fragment_11);

																$.component(node_9, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																	Table_Cell_1($$anchor, {
																		column: 'dueDate',
																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			DualTimeView($$anchor, {
																				get time() {
																					return $.get(invoice).dueAt;
																				}
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell_2) => {
																	Table_Cell_2($$anchor, {
																		column: 'status',
																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			const isDanger = $.derived(() => $.get(status) === 'overdue' || $.get(status) === 'failed' || $.get(status) === 'requires_authentication');
																			const isSuccess = $.derived(() => $.get(status) === 'paid' || $.get(status) === 'succeeded');
																			const isWarning = $.derived(() => $.get(status) === 'pending');
																			var fragment_13 = $.comment();
																			var node_11 = $.first_child(fragment_13);

																			$.component(node_11, () => Layout.Stack, ($$anchor, Layout_Stack) => {
																				Layout_Stack($$anchor, {
																					direction: 'row',
																					gap: 's',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_14 = root_2();
																						var node_12 = $.first_child(fragment_14);

																						{
																							let $0 = $.derived(() => $.get(status) === 'requires_authentication' ? 'failed' : $.get(status));

																							let $1 = $.derived(() => $.get(isDanger)
																								? 'error'
																								: $.get(isWarning) ? 'warning' : $.get(isSuccess) ? 'success' : undefined);

																							Badge(node_12, {
																								variant: 'secondary',
																								get content() {
																									return $.get($0);
																								},

																								get type() {
																									return $.get($1);
																								}
																							});
																						}

																						var node_13 = $.sibling(node_12, 2);

																						{
																							var consequent_1 = ($$anchor) => {
																								Popover($$anchor, {
																									children: $.invalid_default_snippet,
																									$$slots: {
																										default: ($$anchor, $$slotProps) => {
																											const toggle = $.derived(() => $$slotProps.toggle);
																											var fragment_16 = $.comment();
																											var node_14 = $.first_child(fragment_16);

																											$.component(node_14, () => Link.Button, ($$anchor, Link_Button) => {
																												Link_Button($$anchor, {
																													$$events: {
																														click: function (...$$args) {
																															$.get(toggle)?.apply(this, $$args);
																														}
																													},

																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_2 = $.text('Details');

																														$.append($$anchor, text_2);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_16);
																										},

																										tooltip: ($$anchor, $$slotProps) => {
																											var fragment_17 = root_1();
																											var node_15 = $.sibling($.first_child(fragment_17));

																											$.component(node_15, () => Link.Button, ($$anchor, Link_Button_1) => {
																												Link_Button_1($$anchor, {
																													$$events: { click: () => retryPayment($.get(invoice)) },
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_3 = $.text('Try again');

																														$.append($$anchor, text_3);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_17);
																										}
																									}
																								});
																							};

																							$.if(node_13, ($$render) => {
																								if ($.get(invoice)?.lastError) $$render(consequent_1);
																							});
																						}

																						$.append($$anchor, fragment_14);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_13);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_16 = $.sibling(node_10, 2);

																$.component(node_16, () => Table.Cell, ($$anchor, Table_Cell_3) => {
																	Table_Cell_3($$anchor, {
																		column: 'amount',
																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text();

																			$.template_effect(($0) => $.set_text(text_4, $0), [() => formatCurrency($.get(invoice).grossAmount)]);
																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_17 = $.sibling(node_16, 2);

																$.component(node_17, () => Table.Cell, ($$anchor, Table_Cell_4) => {
																	Table_Cell_4($$anchor, {
																		column: 'actions',
																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			Popover($$anchor, {
																				placement: 'bottom-start',
																				padding: 'none',
																				children: $.invalid_default_snippet,
																				$$slots: {
																					default: ($$anchor, $$slotProps) => {
																						const toggle = $.derived(() => $$slotProps.toggle);

																						Button($$anchor, {
																							text: true,
																							icon: true,
																							ariaLabel: 'more options',
																							$$events: {
																								click: function (...$$args) {
																									$.get(toggle)?.apply(this, $$args);
																								}
																							},

																							children: ($$anchor, $$slotProps) => {
																								Icon($$anchor, {
																									get icon() {
																										return IconDotsHorizontal;
																									},
																									size: 's'
																								});
																							},
																							$$slots: { default: true }
																						});
																					},

																					tooltip: ($$anchor, $$slotProps) => {
																						var fragment_22 = $.comment();
																						var node_18 = $.first_child(fragment_22);

																						$.component(node_18, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
																							ActionMenu_Root($$anchor, {
																								slot: 'tooltip',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_23 = root_3();
																									var node_19 = $.first_child(fragment_23);

																									{
																										let $0 = $.derived(() => invoiceUrl($.get(invoice).$id, 'view'));

																										$.component(node_19, () => ActionMenu.Item.Anchor, ($$anchor, ActionMenu_Item_Anchor) => {
																											ActionMenu_Item_Anchor($$anchor, {
																												get leadingIcon() {
																													return IconExternalLink;
																												},
																												external: true,
																												get href() {
																													return $.get($0);
																												},

																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_5 = $.text('View invoice');

																													$.append($$anchor, text_5);
																												},
																												$$slots: { default: true }
																											});
																										});
																									}

																									var node_20 = $.sibling(node_19, 2);

																									{
																										let $0 = $.derived(() => invoiceUrl($.get(invoice).$id, 'download'));

																										$.component(node_20, () => ActionMenu.Item.Anchor, ($$anchor, ActionMenu_Item_Anchor_1) => {
																											ActionMenu_Item_Anchor_1($$anchor, {
																												get leadingIcon() {
																													return IconDownload;
																												},

																												get href() {
																													return $.get($0);
																												},

																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_6 = $.text('Download PDF');

																													$.append($$anchor, text_6);
																												},
																												$$slots: { default: true }
																											});
																										});
																									}

																									var node_21 = $.sibling(node_20, 2);

																									{
																										var consequent_2 = ($$anchor) => {
																											var fragment_24 = $.comment();
																											var node_22 = $.first_child(fragment_24);

																											$.component(node_22, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																												ActionMenu_Item_Button($$anchor, {
																													get leadingIcon() {
																														return IconRefresh;
																													},

																													$$events: {
																														click: () => {
																															retryPayment($.get(invoice));
																															trackEvent(`click_retry_payment`, { from: 'button', source: 'billing_invoice_menu' });
																														}
																													},

																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_7 = $.text('Retry payment');

																														$.append($$anchor, text_7);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_24);
																										};

																										$.if(node_21, ($$render) => {
																											if ($.get(status) === 'overdue' || $.get(status) === 'failed' || $.get(status) === 'abandoned') $$render(consequent_2);
																										});
																									}

																									$.append($$anchor, fragment_23);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_22);
																					}
																				}
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_11);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_10);
												});

												$.append($$anchor, fragment_9);
											};

											$.if(node_2, ($$render) => {
												if ($.get(isLoadingInvoices)) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_3);
									},

									header: ($$anchor, $$slotProps) => {
										const root = $.derived(() => $$slotProps.root);
										var fragment_25 = root_4();
										var node_23 = $.first_child(fragment_25);

										$.component(node_23, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
											Table_Header_Cell($$anchor, {
												column: 'dueDate',
												get root() {
													return $.get(root);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Due date');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										var node_24 = $.sibling(node_23, 2);

										$.component(node_24, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
											Table_Header_Cell_1($$anchor, {
												column: 'status',
												get root() {
													return $.get(root);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('Status');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										var node_25 = $.sibling(node_24, 2);

										$.component(node_25, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_2) => {
											Table_Header_Cell_2($$anchor, {
												column: 'amount',
												get root() {
													return $.get(root);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('Amount due');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});
										});

										var node_26 = $.sibling(node_25, 2);

										$.component(node_26, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_3) => {
											Table_Header_Cell_3($$anchor, {
												column: 'actions',
												get root() {
													return $.get(root);
												}
											});
										});

										$.append($$anchor, fragment_25);
									}
								}
							});
						});

						var node_27 = $.sibling(node_1, 2);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_26 = $.comment();
								var node_28 = $.first_child(fragment_26);

								$.component(node_28, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
									Layout_Stack_1($$anchor, {
										direction: 'row',
										justifyContent: 'space-between',
										alignItems: 'center',
										children: ($$anchor, $$slotProps) => {
											var fragment_27 = root_5();
											var p = $.first_child(fragment_27);
											var text_11 = $.only_child(p);
											var node_29 = $.sibling(p, 2);

											PaginationInline(node_29, {
												limit,
												hidePages: true,
												get total() {
													return $.get(invoiceList).total;
												},

												get offset() {
													return $.get(offset);
												},

												set offset($$value) {
													$.set(offset, $$value, true);
												},
												$$events: { change: loadInvoices }
											});

											$.template_effect(() => $.set_text(text_11, `Total results: ${$.get(invoiceList).total ?? ''}`));
											$.append($$anchor, fragment_27);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_26);
							};

							$.if(node_27, ($$render) => {
								if ($.get(invoiceList).total >= limit) $$render(consequent_3);
							});
						}

						$.append($$anchor, fragment_2);
					};

					var alternate_1 = ($$anchor) => {
						var fragment_28 = $.comment();
						var node_30 = $.first_child(fragment_28);

						$.component(node_30, () => Card.Base, ($$anchor, Card_Base) => {
							Card_Base($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Empty($$anchor, {
										type: 'secondary',
										title: 'You have no payment history.',
										description: 'After you receive your first invoice, you\'ll see it here.'
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_28);
					};

					$.if(node, ($$render) => {
						if ($.get(invoiceList).total > 0 || $.get(isLoadingInvoices)) $$render(consequent_4); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_1);
			}
		}
	});

	$.pop();
	$$cleanup();
}