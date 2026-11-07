import * as $ from 'svelte/internal/server';
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

export default function PaymentMethods($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { organization, paymentMethods, backupMethod, primaryMethod } = $$props;
		let showEdit = false;
		let showDelete = false;
		let showPayment = false;
		let showReplace = false;
		let showUpdateState = false;
		let isSelectedBackup = false;
		let paymentMethodNeedingState = null;
		let dismissedPaymentMethodIds = [];

		const hasPaymentError = $.derived(() => {
			return primaryMethod?.lastError || primaryMethod?.expired || backupMethod?.lastError || backupMethod?.expired;
		});

		async function addPaymentMethod(paymentMethodId) {
			try {
				await sdk.forConsole.organizations.setDefaultPaymentMethod({ organizationId: organization.$id, paymentMethodId });

				addNotification({
					type: 'success',
					message: `A new payment method has been added to ${organization.name}`
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
				await sdk.forConsole.organizations.setBackupPaymentMethod({ organizationId: organization.$id, paymentMethodId });

				addNotification({
					type: 'success',
					message: `A new payment method has been added to ${organization.name}`
				});

				await invalidate(Dependencies.PAYMENT_METHODS);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.OrganizationPaymentUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				overflow: false,
				children: ($$renderer) => {
					$$renderer.push(`<!---->View or update your organization payment methods here.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Payment methods`);
						}
					},

					aside: ($$renderer) => {
						{
							if (organization?.paymentMethodId) {
								$$renderer.push('<!--[0-->');

								if (Table.Root) {
									$$renderer.push('<!--[-->');

									Table.Root($$renderer, {
										columns: [
											{ id: 'cc', width: { min: 225 } },
											{ id: 'name', width: { min: 140 } },
											{ id: 'expiry', width: { min: 75 } },
											{ id: 'status', width: { min: 110 }, hide: !hasPaymentError() },
											{ id: 'actions', width: 40 }
										],
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$renderer, { root }) => {
												if (Table.Row.Base) {
													$$renderer.push('<!--[-->');

													Table.Row.Base($$renderer, {
														root,
														children: ($$renderer) => {
															CreditCardInfo($$renderer, { root, paymentMethod: primaryMethod });
															$$renderer.push(`<!----> `);

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
																								if (primaryMethod?.userId === $.store_get($$store_subs ??= {}, '$user', user)?.$id) {
																									$$renderer.push('<!--[0-->');

																									if (ActionMenu.Item.Button) {
																										$$renderer.push('<!--[-->');

																										ActionMenu.Item.Button($$renderer, {
																											leadingIcon: IconPencil,
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Edit`);
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

																								$$renderer.push(`<!--]--> `);

																								if (ActionMenu.Item.Button) {
																									$$renderer.push('<!--[-->');

																									ActionMenu.Item.Button($$renderer, {
																										leadingIcon: IconSwitchHorizontal,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Replace`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` `);

																								if (ActionMenu.Item.Button) {
																									$$renderer.push('<!--[-->');

																									ActionMenu.Item.Button($$renderer, {
																										leadingIcon: IconTrash,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Remove`);
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

												$$renderer.push(` `);

												if (organization?.backupPaymentMethodId) {
													$$renderer.push('<!--[0-->');

													if (Table.Row.Base) {
														$$renderer.push('<!--[-->');

														Table.Row.Base($$renderer, {
															root,
															children: ($$renderer) => {
																CreditCardInfo($$renderer, { root, isBackup: true, paymentMethod: backupMethod });
																$$renderer.push(`<!----> `);

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
																									if (backupMethod?.userId === $.store_get($$store_subs ??= {}, '$user', user)?.$id) {
																										$$renderer.push('<!--[0-->');

																										if (ActionMenu.Item.Button) {
																											$$renderer.push('<!--[-->');

																											ActionMenu.Item.Button($$renderer, {
																												leadingIcon: IconPencil,
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Edit`);
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

																									$$renderer.push(`<!--]--> `);

																									if (ActionMenu.Item.Button) {
																										$$renderer.push('<!--[-->');

																										ActionMenu.Item.Button($$renderer, {
																											leadingIcon: IconSwitchHorizontal,
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Replace`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (ActionMenu.Item.Button) {
																										$$renderer.push('<!--[-->');

																										ActionMenu.Item.Button($$renderer, {
																											leadingIcon: IconTrash,
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->Remove`);
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
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											},

											header: ($$renderer, { root }) => {
												{
													if (Table.Header.Cell) {
														$$renderer.push('<!--[-->');

														Table.Header.Cell($$renderer, {
															column: 'cc',
															root,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Credit card`);
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
															column: 'name',
															root,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Name`);
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
															column: 'expiry',
															root,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Expiration`);
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
														Table.Header.Cell($$renderer, { column: 'status', root });
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

								if (!organization?.backupPaymentMethodId) {
									$$renderer.push('<!--[0-->');

									const filteredPaymentMethods = paymentMethods.paymentMethods.filter((o) => !!o.last4 && o.$id !== organization?.paymentMethodId);

									$$renderer.push(`<div>`);

									Popover($$renderer, {
										placement: 'bottom-start',
										padding: 'none',
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$renderer, { toggle }) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														alignItems: 'center',
														gap: 's',
														children: ($$renderer) => {
															Button($$renderer, {
																secondary: true,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Add a backup payment method`);
																},

																$$slots: {
																	default: true,
																	start: ($$renderer) => {
																		Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
																	}
																}
															});

															$$renderer.push(`<!----> `);

															Tooltip($$renderer, {
																children: ($$renderer) => {
																	Icon($$renderer, { icon: IconInfo });
																},

																$$slots: {
																	default: true,
																	tooltip: ($$renderer) => {
																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				slot: 'tooltip',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->If your default payment fails, your backup method will be
                                    charged automatically.`);
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

															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},

											tooltip: ($$renderer, { toggle }) => {
												if (ActionMenu.Root) {
													$$renderer.push('<!--[-->');

													ActionMenu.Root($$renderer, {
														slot: 'tooltip',
														children: ($$renderer) => {
															if (paymentMethods.total) {
																$$renderer.push(`<!--[0--><!--[-->`);

																const each_array = $.ensure_array_like(filteredPaymentMethods);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let paymentMethod = each_array[$$index];

																	if (ActionMenu.Item.Button) {
																		$$renderer.push('<!--[-->');

																		ActionMenu.Item.Button($$renderer, {
																			children: ($$renderer) => {
																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						direction: 'row',
																						alignItems: 'center',
																						gap: 'xs',
																						children: ($$renderer) => {
																							CreditCardBrandImage($$renderer, { brand: paymentMethod?.brand });
																							$$renderer.push(`<!----> Card ending in ${$.escape(paymentMethod.last4)}`);
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

																$$renderer.push(`<!--]--> `);
																Divider($$renderer, {});
																$$renderer.push(`<!---->`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> `);

															if (ActionMenu.Item.Button) {
																$$renderer.push('<!--[-->');

																ActionMenu.Item.Button($$renderer, {
																	leadingIcon: IconPlus,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Add new payment method`);
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
										}
									});

									$$renderer.push(`<!----></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							} else {
								$$renderer.push('<!--[-1-->');

								const filteredPaymentMethods = paymentMethods.paymentMethods.filter((o) => !!o.last4 && o.$id !== organization?.backupPaymentMethodId);

								if (Card.Base) {
									$$renderer.push('<!--[-->');

									Card.Base($$renderer, {
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													justifyContent: 'center',
													alignItems: 'center',
													gap: 'm',
													children: ($$renderer) => {
														Popover($$renderer, {
															padding: 'none',
															placement: 'bottom-start',
															children: $.invalid_default_snippet,
															$$slots: {
																default: ($$renderer, { toggle }) => {
																	Button($$renderer, {
																		secondary: true,
																		icon: true,
																		children: ($$renderer) => {
																			Icon($$renderer, { icon: IconPlus, size: 's' });
																		},
																		$$slots: { default: true }
																	});
																},

																tooltip: ($$renderer, { toggle }) => {
																	if (ActionMenu.Root) {
																		$$renderer.push('<!--[-->');

																		ActionMenu.Root($$renderer, {
																			slot: 'tooltip',
																			children: ($$renderer) => {
																				if (paymentMethods.total) {
																					$$renderer.push(`<!--[0--><!--[-->`);

																					const each_array_1 = $.ensure_array_like(filteredPaymentMethods);

																					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																						let paymentMethod = each_array_1[$$index_1];

																						if (ActionMenu.Item.Button) {
																							$$renderer.push('<!--[-->');

																							ActionMenu.Item.Button($$renderer, {
																								children: ($$renderer) => {
																									if (Layout.Stack) {
																										$$renderer.push('<!--[-->');

																										Layout.Stack($$renderer, {
																											direction: 'row',
																											alignItems: 'center',
																											gap: 's',
																											children: ($$renderer) => {
																												CreditCardBrandImage($$renderer, { brand: paymentMethod?.brand });
																												$$renderer.push(`<!----> Card ending in ${$.escape(paymentMethod.last4)}`);
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

																					$$renderer.push(`<!--]--> `);
																					Divider($$renderer, {});
																					$$renderer.push(`<!---->`);
																				} else {
																					$$renderer.push('<!--[-1-->');
																				}

																				$$renderer.push(`<!--]--> `);

																				if (ActionMenu.Item.Button) {
																					$$renderer.push('<!--[-->');

																					ActionMenu.Item.Button($$renderer, {
																						leadingIcon: IconPlus,
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Add new payment method`);
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
															}
														});

														$$renderer.push(`<!----> <span>Add a payment method</span>`);
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
					}
				}
			});

			$$renderer.push(`<!----> `);

			if (showPayment && isCloud && hasStripePublicKey) {
				$$renderer.push('<!--[0-->');

				PaymentModal($$renderer, {
					onCardSubmit: (card) => {
						if (isSelectedBackup) {
							addBackupPaymentMethod(card.$id);
						} else {
							addPaymentMethod(card.$id);
						}
					},

					get show() {
						return showPayment;
					},

					set show($$value) {
						showPayment = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showEdit && isCloud && hasStripePublicKey) {
				$$renderer.push('<!--[0-->');

				EditPaymentModal($$renderer, {
					selectedPaymentMethod: isSelectedBackup ? backupMethod : primaryMethod,
					get show() {
						return showEdit;
					},

					set show($$value) {
						showEdit = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (isCloud && hasStripePublicKey) {
				$$renderer.push('<!--[0-->');

				ReplaceCard($$renderer, {
					organization,
					methods: paymentMethods,
					isBackup: isSelectedBackup,
					get show() {
						return showReplace;
					},

					set show($$value) {
						showReplace = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showDelete && isCloud && hasStripePublicKey) {
				$$renderer.push('<!--[0-->');

				const hasOtherMethod = isSelectedBackup
					? !!organization?.paymentMethodId
					: !!organization?.backupPaymentMethodId;

				DeleteOrgPayment($$renderer, {
					hasOtherMethod,
					isBackup: isSelectedBackup,
					disabled: $.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).requiresPaymentMethod && !hasOtherMethod,
					get showDelete() {
						return showDelete;
					},

					set showDelete($$value) {
						showDelete = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showUpdateState && paymentMethodNeedingState && isCloud && hasStripePublicKey) {
				$$renderer.push('<!--[0-->');

				UpdateStateModal($$renderer, {
					paymentMethod: paymentMethodNeedingState,
					get show() {
						return showUpdateState;
					},

					set show($$value) {
						showUpdateState = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
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