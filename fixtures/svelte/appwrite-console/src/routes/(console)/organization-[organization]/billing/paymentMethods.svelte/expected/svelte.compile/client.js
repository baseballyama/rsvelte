import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { sdk } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid, CreditCardBrandImage, CreditCardInfo } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { Button } from '$lib/elements/forms';
import { hasStripePublicKey, isCloud } from '$lib/system';
import DeleteOrgPayment from './deleteOrgPayment.svelte';
import ReplaceCard from './replaceCard.svelte';
import EditPaymentModal from '$routes/(console)/account/payments/editPaymentModal.svelte';
import PaymentModal from '$lib/components/billing/paymentModal.svelte';
import UpdateStateModal from '$lib/components/billing/updateStateModal.svelte';
import { user } from '$lib/stores/user';

import {
	ActionMenu,
	Card,
	Divider,
	Icon,
	Layout,
	Popover,
	Table,
	Tooltip,
	Typography
} from '@appwrite.io/pink-svelte';

import {
	IconDotsHorizontal,
	IconInfo,
	IconPencil,
	IconPlus,
	IconSwitchHorizontal,
	IconTrash
} from '@appwrite.io/pink-icons-svelte';

import { currentPlan } from '$lib/stores/organization';

var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> `, 1);
var root_5 = $.from_html(`<div><!></div>`);
var root_6 = $.from_html(`<!> <span>Add a payment method</span>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function PaymentMethods($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showEdit = $.state(false);
	let showDelete = $.state(false);
	let showPayment = $.state(false);
	let showReplace = $.state(false);
	let showUpdateState = $.state(false);
	let isSelectedBackup = $.state(false);
	let paymentMethodNeedingState = $.state(null);
	let dismissedPaymentMethodIds = $.state($.proxy([]));

	const hasPaymentError = $.derived(() => {
		return $$props.primaryMethod?.lastError || $$props.primaryMethod?.expired || $$props.backupMethod?.lastError || $$props.backupMethod?.expired;
	});

	async function addPaymentMethod(paymentMethodId) {
		try {
			await sdk.forConsole.organizations.setDefaultPaymentMethod({ organizationId: $$props.organization.$id, paymentMethodId });

			addNotification({
				type: 'success',
				message: `A new payment method has been added to ${$$props.organization.name}`
			});

			trackEvent(Submit.OrganizationPaymentUpdate);
			await invalidate(Dependencies.PAYMENT_METHODS);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.OrganizationPaymentUpdate);
		}
	}

	async function addBackupPaymentMethod(paymentMethodId) {
		try {
			await sdk.forConsole.organizations.setBackupPaymentMethod({ organizationId: $$props.organization.$id, paymentMethodId });

			addNotification({
				type: 'success',
				message: `A new payment method has been added to ${$$props.organization.name}`
			});

			await invalidate(Dependencies.PAYMENT_METHODS);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.OrganizationPaymentUpdate);
		}
	}

	$.user_effect(() => {
		if (!$.get(showReplace)) {
			$.set(isSelectedBackup, false);
		}
	});

	$.user_effect(() => {
		if ($$props.paymentMethods?.paymentMethods && !$.get(showUpdateState) && !$.get(paymentMethodNeedingState)) {
			const usMethodWithoutState = $$props.paymentMethods.paymentMethods.find((method) => method?.country?.toLowerCase() === 'us' && (!method.state || method.state.trim() === '') && !!method.last4 && !$.get(dismissedPaymentMethodIds).includes(method.$id));

			if (usMethodWithoutState) {
				$.set(paymentMethodNeedingState, usMethodWithoutState, true);
				$.set(showUpdateState, true);
			}
		}
	});

	$.user_effect(() => {
		if (!$.get(showUpdateState) && $.get(paymentMethodNeedingState)) {
			$.set(
				dismissedPaymentMethodIds,
				[
					...$.get(dismissedPaymentMethodIds),
					$.get(paymentMethodNeedingState).$id
				],
				true
			);

			$.set(paymentMethodNeedingState, null);
		}
	});

	var fragment = root_7();
	var node = $.first_child(fragment);

	CardGrid(node, {
		overflow: false,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('View or update your organization payment methods here.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Payment methods');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_5 = ($$anchor) => {
						var fragment_2 = root_2();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => [
								{ id: 'cc', width: { min: 225 } },
								{ id: 'name', width: { min: 140 } },
								{ id: 'expiry', width: { min: 75 } },
								{
									id: 'status',
									width: { min: 110 },
									hide: !$.get(hasPaymentError)
								},
								{ id: 'actions', width: 40 }
							]);

							$.component(node_2, () => Table.Root, ($$anchor, Table_Root) => {
								Table_Root($$anchor, {
									get columns() {
										return $.get($0);
									},
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$anchor, $$slotProps) => {
											const root = $.derived(() => $$slotProps.root);
											var fragment_3 = root_2();
											var node_3 = $.first_child(fragment_3);

											$.component(node_3, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
												Table_Row_Base($$anchor, {
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root_2();
														var node_4 = $.first_child(fragment_4);

														CreditCardInfo(node_4, {
															get root() {
																return $.get(root);
															},

															get paymentMethod() {
																return $$props.primaryMethod;
															}
														});

														var node_5 = $.sibling(node_4, 2);

														$.component(node_5, () => Table.Cell, ($$anchor, Table_Cell) => {
															Table_Cell($$anchor, {
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
																				var fragment_8 = $.comment();
																				var node_6 = $.first_child(fragment_8);

																				$.component(node_6, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
																					ActionMenu_Root($$anchor, {
																						slot: 'tooltip',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_9 = root_1();
																							var node_7 = $.first_child(fragment_9);

																							{
																								var consequent = ($$anchor) => {
																									var fragment_10 = $.comment();
																									var node_8 = $.first_child(fragment_10);

																									$.component(node_8, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																										ActionMenu_Item_Button($$anchor, {
																											get leadingIcon() {
																												return IconPencil;
																											},

																											$$events: {
																												click: () => {
																													$.set(isSelectedBackup, false);
																													$.set(showEdit, true);
																												}
																											},

																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_2 = $.text('Edit');

																												$.append($$anchor, text_2);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_10);
																								};

																								$.if(node_7, ($$render) => {
																									if ($$props.primaryMethod?.userId === $user()?.$id) $$render(consequent);
																								});
																							}

																							var node_9 = $.sibling(node_7, 2);

																							$.component(node_9, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_1) => {
																								ActionMenu_Item_Button_1($$anchor, {
																									get leadingIcon() {
																										return IconSwitchHorizontal;
																									},

																									$$events: {
																										click: () => {
																											$.set(isSelectedBackup, false);
																											$.set(showReplace, true);
																										}
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_3 = $.text('Replace');

																										$.append($$anchor, text_3);
																									},
																									$$slots: { default: true }
																								});
																							});

																							var node_10 = $.sibling(node_9, 2);

																							$.component(node_10, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_2) => {
																								ActionMenu_Item_Button_2($$anchor, {
																									get leadingIcon() {
																										return IconTrash;
																									},

																									$$events: {
																										click: () => {
																											$.set(isSelectedBackup, false);
																											$.set(showDelete, true);
																										}
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_4 = $.text('Remove');

																										$.append($$anchor, text_4);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_9);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_8);
																			}
																		}
																	});
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var node_11 = $.sibling(node_3, 2);

											{
												var consequent_2 = ($$anchor) => {
													var fragment_11 = $.comment();
													var node_12 = $.first_child(fragment_11);

													$.component(node_12, () => Table.Row.Base, ($$anchor, Table_Row_Base_1) => {
														Table_Row_Base_1($$anchor, {
															get root() {
																return $.get(root);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_12 = root_2();
																var node_13 = $.first_child(fragment_12);

																CreditCardInfo(node_13, {
																	get root() {
																		return $.get(root);
																	},
																	isBackup: true,
																	get paymentMethod() {
																		return $$props.backupMethod;
																	}
																});

																var node_14 = $.sibling(node_13, 2);

																$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																	Table_Cell_1($$anchor, {
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
																						var fragment_16 = $.comment();
																						var node_15 = $.first_child(fragment_16);

																						$.component(node_15, () => ActionMenu.Root, ($$anchor, ActionMenu_Root_1) => {
																							ActionMenu_Root_1($$anchor, {
																								slot: 'tooltip',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_17 = root_1();
																									var node_16 = $.first_child(fragment_17);

																									{
																										var consequent_1 = ($$anchor) => {
																											var fragment_18 = $.comment();
																											var node_17 = $.first_child(fragment_18);

																											$.component(node_17, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_3) => {
																												ActionMenu_Item_Button_3($$anchor, {
																													get leadingIcon() {
																														return IconPencil;
																													},

																													$$events: {
																														click: () => {
																															$.set(isSelectedBackup, true);
																															$.set(showEdit, true);
																														}
																													},

																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_5 = $.text('Edit');

																														$.append($$anchor, text_5);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_18);
																										};

																										$.if(node_16, ($$render) => {
																											if ($$props.backupMethod?.userId === $user()?.$id) $$render(consequent_1);
																										});
																									}

																									var node_18 = $.sibling(node_16, 2);

																									$.component(node_18, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_4) => {
																										ActionMenu_Item_Button_4($$anchor, {
																											get leadingIcon() {
																												return IconSwitchHorizontal;
																											},

																											$$events: {
																												click: () => {
																													$.set(isSelectedBackup, true);
																													$.set(showReplace, true);
																												}
																											},

																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_6 = $.text('Replace');

																												$.append($$anchor, text_6);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_19 = $.sibling(node_18, 2);

																									$.component(node_19, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_5) => {
																										ActionMenu_Item_Button_5($$anchor, {
																											get leadingIcon() {
																												return IconTrash;
																											},

																											$$events: {
																												click: () => {
																													$.set(isSelectedBackup, true);
																													$.set(showDelete, true);
																												}
																											},

																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_7 = $.text('Remove');

																												$.append($$anchor, text_7);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_17);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_16);
																					}
																				}
																			});
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
												};

												$.if(node_11, ($$render) => {
													if ($$props.organization?.backupPaymentMethodId) $$render(consequent_2);
												});
											}

											$.append($$anchor, fragment_3);
										},

										header: ($$anchor, $$slotProps) => {
											const root = $.derived(() => $$slotProps.root);
											var fragment_19 = root_3();
											var node_20 = $.first_child(fragment_19);

											$.component(node_20, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
												Table_Header_Cell($$anchor, {
													column: 'cc',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text('Credit card');

														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});
											});

											var node_21 = $.sibling(node_20, 2);

											$.component(node_21, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
												Table_Header_Cell_1($$anchor, {
													column: 'name',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text('Name');

														$.append($$anchor, text_9);
													},
													$$slots: { default: true }
												});
											});

											var node_22 = $.sibling(node_21, 2);

											$.component(node_22, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_2) => {
												Table_Header_Cell_2($$anchor, {
													column: 'expiry',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_10 = $.text('Expiration');

														$.append($$anchor, text_10);
													},
													$$slots: { default: true }
												});
											});

											var node_23 = $.sibling(node_22, 2);

											$.component(node_23, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_3) => {
												Table_Header_Cell_3($$anchor, {
													column: 'status',
													get root() {
														return $.get(root);
													}
												});
											});

											var node_24 = $.sibling(node_23, 2);

											$.component(node_24, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_4) => {
												Table_Header_Cell_4($$anchor, {
													column: 'actions',
													get root() {
														return $.get(root);
													}
												});
											});

											$.append($$anchor, fragment_19);
										}
									}
								});
							});
						}

						var node_25 = $.sibling(node_2, 2);

						{
							var consequent_4 = ($$anchor) => {
								const filteredPaymentMethods = $.derived(() => $$props.paymentMethods.paymentMethods.filter((o) => !!o.last4 && o.$id !== $$props.organization?.paymentMethodId));
								var div = root_5();
								var node_26 = $.child(div);

								Popover(node_26, {
									placement: 'bottom-start',
									padding: 'none',
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$anchor, $$slotProps) => {
											const toggle = $.derived(() => $$slotProps.toggle);
											var fragment_20 = $.comment();
											var node_27 = $.first_child(fragment_20);

											$.component(node_27, () => Layout.Stack, ($$anchor, Layout_Stack) => {
												Layout_Stack($$anchor, {
													direction: 'row',
													alignItems: 'center',
													gap: 's',
													children: ($$anchor, $$slotProps) => {
														var fragment_21 = root_2();
														var node_28 = $.first_child(fragment_21);

														Button(node_28, {
															secondary: true,
															$$events: {
																click: (e) => {
																	if ($.get(filteredPaymentMethods).length) {
																		$.get(toggle)(e);
																	} else {
																		$.set(isSelectedBackup, true);
																		$.set(showPayment, true);
																	}
																}
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_11 = $.text('Add a backup payment method');

																$.append($$anchor, text_11);
															},

															$$slots: {
																default: true,
																start: ($$anchor, $$slotProps) => {
																	Icon($$anchor, {
																		get icon() {
																			return IconPlus;
																		},
																		slot: 'start',
																		size: 's'
																	});
																}
															}
														});

														var node_29 = $.sibling(node_28, 2);

														Tooltip(node_29, {
															children: ($$anchor, $$slotProps) => {
																Icon($$anchor, {
																	get icon() {
																		return IconInfo;
																	}
																});
															},

															$$slots: {
																default: true,
																tooltip: ($$anchor, $$slotProps) => {
																	var fragment_24 = $.comment();
																	var node_30 = $.first_child(fragment_24);

																	$.component(node_30, () => Typography.Text, ($$anchor, Typography_Text) => {
																		Typography_Text($$anchor, {
																			slot: 'tooltip',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_12 = $.text('If your default payment fails, your backup method will be\n                                    charged automatically.');

																				$.append($$anchor, text_12);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_24);
																}
															}
														});

														$.append($$anchor, fragment_21);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_20);
										},

										tooltip: ($$anchor, $$slotProps) => {
											var fragment_25 = $.comment();
											var node_31 = $.first_child(fragment_25);
											const toggle = $.derived(() => $$slotProps.toggle);

											$.component(node_31, () => ActionMenu.Root, ($$anchor, ActionMenu_Root_2) => {
												ActionMenu_Root_2($$anchor, {
													slot: 'tooltip',
													children: $.invalid_default_snippet,
													$$slots: {
														default: ($$anchor, $$slotProps) => {
															var fragment_26 = root_2();
															var node_32 = $.first_child(fragment_26);

															{
																var consequent_3 = ($$anchor) => {
																	var fragment_27 = root_2();
																	var node_33 = $.first_child(fragment_27);

																	$.each(node_33, 17, () => $.get(filteredPaymentMethods), $.index, ($$anchor, paymentMethod) => {
																		var fragment_28 = $.comment();
																		var node_34 = $.first_child(fragment_28);

																		$.component(node_34, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_6) => {
																			ActionMenu_Item_Button_6($$anchor, {
																				$$events: {
																					click: () => addBackupPaymentMethod($.get(paymentMethod)?.$id)
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_29 = $.comment();
																					var node_35 = $.first_child(fragment_29);

																					$.component(node_35, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
																						Layout_Stack_1($$anchor, {
																							direction: 'row',
																							alignItems: 'center',
																							gap: 'xs',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_30 = root_4();
																								var node_36 = $.first_child(fragment_30);

																								{
																									let $0 = $.derived(() => $.get(paymentMethod)?.brand);

																									CreditCardBrandImage(node_36, {
																										get brand() {
																											return $.get($0);
																										}
																									});
																								}

																								var text_13 = $.sibling(node_36);

																								$.template_effect(() => $.set_text(text_13, ` Card ending in ${$.get(paymentMethod).last4 ?? ''}`));
																								$.append($$anchor, fragment_30);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_29);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_28);
																	});

																	var node_37 = $.sibling(node_33, 2);

																	Divider(node_37, {});
																	$.append($$anchor, fragment_27);
																};

																$.if(node_32, ($$render) => {
																	if ($$props.paymentMethods.total) $$render(consequent_3);
																});
															}

															var node_38 = $.sibling(node_32, 2);

															$.component(node_38, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_7) => {
																ActionMenu_Item_Button_7($$anchor, {
																	get leadingIcon() {
																		return IconPlus;
																	},

																	$$events: {
																		click: (e) => {
																			$.get(toggle)(e);
																			$.set(showPayment, true);
																		}
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_14 = $.text('Add new payment method');

																		$.append($$anchor, text_14);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_26);
														}
													}
												});
											});

											$.append($$anchor, fragment_25);
										}
									}
								});

								$.reset(div);
								$.append($$anchor, div);
							};

							$.if(node_25, ($$render) => {
								if (!$$props.organization?.backupPaymentMethodId) $$render(consequent_4);
							});
						}

						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						const filteredPaymentMethods = $.derived(() => $$props.paymentMethods.paymentMethods.filter((o) => !!o.last4 && o.$id !== $$props.organization?.backupPaymentMethodId));
						var fragment_31 = $.comment();
						var node_39 = $.first_child(fragment_31);

						$.component(node_39, () => Card.Base, ($$anchor, Card_Base) => {
							Card_Base($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_32 = $.comment();
									var node_40 = $.first_child(fragment_32);

									$.component(node_40, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
										Layout_Stack_2($$anchor, {
											justifyContent: 'center',
											alignItems: 'center',
											gap: 'm',
											children: ($$anchor, $$slotProps) => {
												var fragment_33 = root_6();
												var node_41 = $.first_child(fragment_33);

												Popover(node_41, {
													padding: 'none',
													placement: 'bottom-start',
													children: $.invalid_default_snippet,
													$$slots: {
														default: ($$anchor, $$slotProps) => {
															const toggle = $.derived(() => $$slotProps.toggle);

															Button($$anchor, {
																secondary: true,
																icon: true,
																$$events: {
																	click: function (...$$args) {
																		$.get(toggle)?.apply(this, $$args);
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	Icon($$anchor, {
																		get icon() {
																			return IconPlus;
																		},
																		size: 's'
																	});
																},
																$$slots: { default: true }
															});
														},

														tooltip: ($$anchor, $$slotProps) => {
															var fragment_36 = $.comment();
															var node_42 = $.first_child(fragment_36);
															const toggle = $.derived(() => $$slotProps.toggle);

															$.component(node_42, () => ActionMenu.Root, ($$anchor, ActionMenu_Root_3) => {
																ActionMenu_Root_3($$anchor, {
																	slot: 'tooltip',
																	children: $.invalid_default_snippet,
																	$$slots: {
																		default: ($$anchor, $$slotProps) => {
																			var fragment_37 = root_2();
																			var node_43 = $.first_child(fragment_37);

																			{
																				var consequent_6 = ($$anchor) => {
																					var fragment_38 = root_2();
																					var node_44 = $.first_child(fragment_38);

																					$.each(node_44, 17, () => $.get(filteredPaymentMethods), $.index, ($$anchor, paymentMethod) => {
																						var fragment_39 = $.comment();
																						var node_45 = $.first_child(fragment_39);

																						$.component(node_45, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_8) => {
																							ActionMenu_Item_Button_8($$anchor, {
																								$$events: { click: () => addPaymentMethod($.get(paymentMethod)?.$id) },
																								children: ($$anchor, $$slotProps) => {
																									var fragment_40 = $.comment();
																									var node_46 = $.first_child(fragment_40);

																									$.component(node_46, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																										Layout_Stack_3($$anchor, {
																											direction: 'row',
																											alignItems: 'center',
																											gap: 's',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_41 = root_4();
																												var node_47 = $.first_child(fragment_41);

																												{
																													let $0 = $.derived(() => $.get(paymentMethod)?.brand);

																													CreditCardBrandImage(node_47, {
																														get brand() {
																															return $.get($0);
																														}
																													});
																												}

																												var text_15 = $.sibling(node_47);

																												$.template_effect(() => $.set_text(text_15, ` Card ending in ${$.get(paymentMethod).last4 ?? ''}`));
																												$.append($$anchor, fragment_41);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_40);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_39);
																					});

																					var node_48 = $.sibling(node_44, 2);

																					Divider(node_48, {});
																					$.append($$anchor, fragment_38);
																				};

																				$.if(node_43, ($$render) => {
																					if ($$props.paymentMethods.total) $$render(consequent_6);
																				});
																			}

																			var node_49 = $.sibling(node_43, 2);

																			$.component(node_49, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_9) => {
																				ActionMenu_Item_Button_9($$anchor, {
																					get leadingIcon() {
																						return IconPlus;
																					},

																					$$events: {
																						click: (e) => {
																							$.get(toggle)(e);
																							$.set(showPayment, true);
																						}
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_16 = $.text('Add new payment method');

																						$.append($$anchor, text_16);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_37);
																		}
																	}
																});
															});

															$.append($$anchor, fragment_36);
														}
													}
												});

												$.next(2);
												$.append($$anchor, fragment_33);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_32);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_31);
					};

					$.if(node_1, ($$render) => {
						if ($$props.organization?.paymentMethodId) $$render(consequent_5); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_50 = $.sibling(node, 2);

	{
		var consequent_7 = ($$anchor) => {
			PaymentModal($$anchor, {
				onCardSubmit: (card) => {
					if ($.get(isSelectedBackup)) {
						addBackupPaymentMethod(card.$id);
					} else {
						addPaymentMethod(card.$id);
					}
				},

				get show() {
					return $.get(showPayment);
				},

				set show($$value) {
					$.set(showPayment, $$value, true);
				}
			});
		};

		$.if(node_50, ($$render) => {
			if ($.get(showPayment) && isCloud && hasStripePublicKey) $$render(consequent_7);
		});
	}

	var node_51 = $.sibling(node_50, 2);

	{
		var consequent_8 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(isSelectedBackup) ? $$props.backupMethod : $$props.primaryMethod);

				EditPaymentModal($$anchor, {
					get selectedPaymentMethod() {
						return $.get($0);
					},

					get show() {
						return $.get(showEdit);
					},

					set show($$value) {
						$.set(showEdit, $$value, true);
					}
				});
			}
		};

		$.if(node_51, ($$render) => {
			if ($.get(showEdit) && isCloud && hasStripePublicKey) $$render(consequent_8);
		});
	}

	var node_52 = $.sibling(node_51, 2);

	{
		var consequent_9 = ($$anchor) => {
			ReplaceCard($$anchor, {
				get organization() {
					return $$props.organization;
				},

				get methods() {
					return $$props.paymentMethods;
				},

				get isBackup() {
					return $.get(isSelectedBackup);
				},

				get show() {
					return $.get(showReplace);
				},

				set show($$value) {
					$.set(showReplace, $$value, true);
				}
			});
		};

		$.if(node_52, ($$render) => {
			if (isCloud && hasStripePublicKey) $$render(consequent_9);
		});
	}

	var node_53 = $.sibling(node_52, 2);

	{
		var consequent_10 = ($$anchor) => {
			const hasOtherMethod = $.derived(() => $.get(isSelectedBackup)
				? !!$$props.organization?.paymentMethodId
				: !!$$props.organization?.backupPaymentMethodId);

			{
				let $0 = $.derived(() => $currentPlan().requiresPaymentMethod && !$.get(hasOtherMethod));

				DeleteOrgPayment($$anchor, {
					get hasOtherMethod() {
						return $.get(hasOtherMethod);
					},

					get isBackup() {
						return $.get(isSelectedBackup);
					},

					get disabled() {
						return $.get($0);
					},

					get showDelete() {
						return $.get(showDelete);
					},

					set showDelete($$value) {
						$.set(showDelete, $$value, true);
					}
				});
			}
		};

		$.if(node_53, ($$render) => {
			if ($.get(showDelete) && isCloud && hasStripePublicKey) $$render(consequent_10);
		});
	}

	var node_54 = $.sibling(node_53, 2);

	{
		var consequent_11 = ($$anchor) => {
			UpdateStateModal($$anchor, {
				get paymentMethod() {
					return $.get(paymentMethodNeedingState);
				},

				get show() {
					return $.get(showUpdateState);
				},

				set show($$value) {
					$.set(showUpdateState, $$value, true);
				}
			});
		};

		$.if(node_54, ($$render) => {
			if ($.get(showUpdateState) && $.get(paymentMethodNeedingState) && isCloud && hasStripePublicKey) $$render(consequent_11);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}