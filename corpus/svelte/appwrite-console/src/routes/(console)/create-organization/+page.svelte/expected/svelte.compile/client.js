import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate, goto, invalidate, preloadData } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { PlanComparisonBox, PlanSelection, SelectPaymentMethod } from '$lib/components/billing';
import ValidateCreditModal from '$lib/components/billing/validateCreditModal.svelte';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputTags, InputText } from '$lib/elements/forms';
import { Wizard } from '$lib/layout';

import {
	billingIdToPlan,
	getBasePlanFromGroup,
	isPaymentAuthenticationRequired,
	teamStatusUpgrading
} from '$lib/stores/billing';

import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { confirmPayment } from '$lib/stores/stripe';
import { BillingPlanGroup, ID } from '@appwrite.io/console';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { Divider, Fieldset, Icon, Layout, Link, Typography } from '@appwrite.io/pink-svelte';
import { writable } from 'svelte/store';
import EstimatedTotalBox from '$lib/components/billing/estimatedTotalBox.svelte';
import { onMount } from 'svelte';

var root = $.from_html(`For more details on our plans, visit our <!>.`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $isSubmitting = () => $.store_get($.get(isSubmitting), '$isSubmitting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showExitModal = $.state(false);
	let selectedPlan = $.state($.proxy($$props.data.plan));
	let previousPage = $.state($.proxy(resolve('/(console)')));
	let selectedCoupon = $.state($.proxy($$props.data.coupon));
	let isSubmitting = $.state($.proxy(writable(false)));
	let formComponent = $.state(null);
	let name = $.state(null);
	let taxId = $.state(null);
	let collaborators = $.state($.proxy([]));
	let paymentMethodId = $.state(null);
	let showCreditModal = $.state(false);
	let billingBudget = $.state(undefined);

	afterNavigate(({ from }) => {
		$.set(previousPage, from?.url?.pathname || $.get(previousPage), true);
	});

	onMount(async () => {
		if (page.url.searchParams.has('coupon')) {
			const coupon = page.url.searchParams.get('coupon');

			try {
				$.set(selectedCoupon, await sdk.forConsole.console.getCoupon({ couponId: coupon }), true);
			} catch(e) {
				$.set(selectedCoupon, { code: null, status: null, credits: null }, true);
			}
		}

		if (page.url.searchParams.has('name')) {
			$.set(name, page.url.searchParams.get('name'), true);
		}

		if (page.url.searchParams.has('plan')) {
			const plan = page.url.searchParams.get('plan');

			if (plan) {
				$.set(selectedPlan, billingIdToPlan(plan), true);
			}
		}

		if ($$props.data?.hasFreeOrganizations || page.url.searchParams.has('type') && page.url.searchParams.get('type') === 'createPro') {
			$.set(selectedPlan, getBasePlanFromGroup(BillingPlanGroup.Pro), true);
		}

		if (page.url.searchParams.has('type')) {
			const type = page.url.searchParams.get('type');

			if (type === 'payment_confirmed') {
				const organizationId = page.url.searchParams.get('id');
				const invites = page.url.searchParams.get('invites').split(',');

				await validate(organizationId, invites);
			}
		}
	});

	async function preloadAndNavigate(organizationId) {
		const resolvedUrl = resolve('/(console)/organization-[organization]', { organization: organizationId });

		await preloadData(resolvedUrl);
		await goto(resolvedUrl);
	}

	async function validate(organizationId, invites) {
		try {
			const org = await sdk.forConsole.organizations.validatePayment({ organizationId, invites });

			if (!isPaymentAuthenticationRequired(org)) {
				await invalidate(Dependencies.ACCOUNT);
				await preloadAndNavigate(org.$id);

				if (org.status === teamStatusUpgrading) {
					addNotification({
						type: 'info',
						message: 'Payment is processing — your plan will activate within a few minutes.'
					});
				} else {
					addNotification({
						type: 'success',
						message: `${org.name ?? 'Organization'} has been created`
					});
				}
			}
		} catch(e) {
			addNotification({ type: 'error', message: e.message });
			trackError(e, Submit.OrganizationCreate);
		}
	}

	async function create() {
		try {
			let org;

			if ($.get(selectedPlan).group === BillingPlanGroup.Starter) {
				org = await sdk.forConsole.organizations.create({
					organizationId: ID.unique(),
					name: $.get(name),
					billingPlan: getBasePlanFromGroup(BillingPlanGroup.Starter).$id
				});
			} else {
				org = await sdk.forConsole.organizations.create({
					organizationId: ID.unique(),
					name: $.get(name),
					billingPlan: $.get(selectedPlan).$id,
					paymentMethodId: $.get(paymentMethodId),
					couponId: $.get(selectedCoupon)?.code,
					invites: $.get(collaborators),
					budget: $.get(billingBudget),
					taxId: $.get(taxId)
				});

				if (isPaymentAuthenticationRequired(org)) {
					const clientSecret = org.clientSecret;
					const params = new URLSearchParams();

					params.append('type', 'payment_confirmed');
					params.append('id', org.organizationId);

					for (const [key, value] of page.url.searchParams.entries()) {
						if (key !== 'type' && key !== 'id') {
							params.append(key, value);
						}
					}

					params.append('invites', $.get(collaborators).join(','));

					const resolvedUrl = resolve('/(console)/create-organization');

					const outcome = await confirmPayment({
						clientSecret,
						paymentMethodId: $.get(paymentMethodId),
						route: `${resolvedUrl}?${params}`,
						redirectIfRequired: true
					});

					if (!outcome || outcome.status === 'error') {
						try {
							await sdk.forConsole.organizations.validatePayment({ organizationId: org.organizationId, invites: [] });
						} catch {
							// expected: backend throws BILLING_PAYMENT_FAILED after deleting the draft team
						}

						return;
					}

					if (outcome.status === 'requires_action') {
						return;
					}

					await validate(org.organizationId, $.get(collaborators));
				}
			}

			trackEvent(Submit.OrganizationCreate, {
				plan: $.get(selectedPlan).name,
				budget_cap_enabled: $.get(billingBudget) !== null,
				members_invited: $.get(collaborators)?.length
			});

			if (!isPaymentAuthenticationRequired(org)) {
				await invalidate(Dependencies.ACCOUNT);
				await preloadAndNavigate(org.$id);

				addNotification({
					type: 'success',
					message: `${org.name ?? 'Organization'} has been created`
				});
			}
		} catch(e) {
			addNotification({ type: 'error', message: e.message });
			trackError(e, Submit.OrganizationCreate);
		}
	}

	var fragment = root_1();

	$.head('16lisiw', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Create organization - Appwrite';
		});
	});

	var node = $.first_child(fragment);

	Wizard(node, {
		title: 'Create organization',
		get href() {
			return $.get(previousPage);
		},
		confirmExit: true,
		get showExitModal() {
			return $.get(showExitModal);
		},

		set showExitModal($$value) {
			$.set(showExitModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Form($$anchor, {
					onSubmit: create,
					get isSubmitting() {
						return $.get(isSubmitting);
					},

					set isSubmitting($$value) {
						$.store_unsub($.set(isSubmitting, $$value, true), '$isSubmitting', $$stores);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 'xxl',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_2 = $.first_child(fragment_3);

									Fieldset(node_2, {
										legend: 'Options',
										children: ($$anchor, $$slotProps) => {
											InputText($$anchor, {
												label: 'Organization name',
												placeholder: 'Enter organization name',
												autofocus: true,
												id: 'name',
												required: true,
												get value() {
													return $.get(name);
												},

												set value($$value) {
													$.set(name, $$value, true);
												}
											});
										},
										$$slots: { default: true }
									});

									var node_3 = $.sibling(node_2, 2);

									Fieldset(node_3, {
										legend: 'Select plan',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_4 = $.first_child(fragment_5);

											$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_1();
														var node_5 = $.first_child(fragment_6);

														$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
															Typography_Text($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_7 = root();
																	var node_6 = $.sibling($.first_child(fragment_7));

																	$.component(node_6, () => Link.Anchor, ($$anchor, Link_Anchor) => {
																		Link_Anchor($$anchor, {
																			href: 'https://appwrite.io/pricing',
																			target: '_blank',
																			rel: 'noopener noreferrer',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text = $.text('pricing page');

																				$.append($$anchor, text);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.next();
																	$.append($$anchor, fragment_7);
																},
																$$slots: { default: true }
															});
														});

														var node_7 = $.sibling(node_5, 2);

														PlanSelection(node_7, {
															isNewOrg: true,
															get anyOrgFree() {
																return $$props.data.hasFreeOrganizations;
															},

															get selectedBillingPlan() {
																return $.get(selectedPlan);
															},

															set selectedBillingPlan($$value) {
																$.set(selectedPlan, $$value, true);
															}
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});

									var node_8 = $.sibling(node_3, 2);

									{
										var consequent_2 = ($$anchor) => {
											var fragment_8 = root_1();
											var node_9 = $.first_child(fragment_8);

											Fieldset(node_9, {
												legend: 'Payment',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = $.comment();
													var node_10 = $.first_child(fragment_9);

													$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
														Layout_Stack_2($$anchor, {
															gap: 's',
															alignItems: 'flex-start',
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root_1();
																var node_11 = $.first_child(fragment_10);

																SelectPaymentMethod(node_11, {
																	get methods() {
																		return $$props.data.paymentMethods;
																	},

																	get value() {
																		return $.get(paymentMethodId);
																	},

																	set value($$value) {
																		$.set(paymentMethodId, $$value, true);
																	},

																	get taxId() {
																		return $.get(taxId);
																	},

																	set taxId($$value) {
																		$.set(taxId, $$value, true);
																	},

																	$$slots: {
																		actions: ($$anchor, $$slotProps) => {
																			var fragment_11 = $.comment();
																			var node_12 = $.first_child(fragment_11);

																			{
																				var consequent = ($$anchor) => {
																					var fragment_12 = root_1();
																					var node_13 = $.first_child(fragment_12);

																					Divider(node_13, { vertical: true, style: 'height: 2rem;' });

																					var node_14 = $.sibling(node_13, 2);

																					Button(node_14, {
																						compact: true,
																						$$events: { click: () => $.set(showCreditModal, true) },
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_1 = $.text('Add credits');

																							$.append($$anchor, text_1);
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

																					$.append($$anchor, fragment_12);
																				};

																				$.if(node_12, ($$render) => {
																					if (!$.get(selectedCoupon)?.code && $.get(paymentMethodId)) $$render(consequent);
																				});
																			}

																			$.append($$anchor, fragment_11);
																		}
																	}
																});

																var node_15 = $.sibling(node_11, 2);

																{
																	var consequent_1 = ($$anchor) => {
																		Button($$anchor, {
																			compact: true,
																			$$events: { click: () => $.set(showCreditModal, true) },
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text('Add credits');

																				$.append($$anchor, text_2);
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
																	};

																	$.if(node_15, ($$render) => {
																		if (!$.get(selectedCoupon)?.code && !$.get(paymentMethodId)) $$render(consequent_1);
																	});
																}

																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});

											var node_16 = $.sibling(node_9, 2);

											Fieldset(node_16, {
												legend: 'Invite members',
												children: ($$anchor, $$slotProps) => {
													InputTags($$anchor, {
														label: 'Invite members by email',
														placeholder: 'Enter email address(es)',
														id: 'members',
														get tags() {
															return $.get(collaborators);
														},

														set tags($$value) {
															$.set(collaborators, $$value, true);
														}
													});
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_8);
										};

										$.if(node_8, ($$render) => {
											if ($.get(selectedPlan).supportsCredits) $$render(consequent_2);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}),
				($$value) => $.set(formComponent, $$value, true),
				() => $.get(formComponent)
			);
		},

		$$slots: {
			default: true,
			aside: ($$anchor, $$slotProps) => {
				var fragment_17 = $.comment();
				var node_17 = $.first_child(fragment_17);

				{
					var consequent_3 = ($$anchor) => {
						EstimatedTotalBox($$anchor, {
							get billingPlan() {
								return $.get(selectedPlan);
							},

							get collaborators() {
								return $.get(collaborators);
							},

							get couponData() {
								return $.get(selectedCoupon);
							},

							set couponData($$value) {
								$.set(selectedCoupon, $$value, true);
							},

							get billingBudget() {
								return $.get(billingBudget);
							},

							set billingBudget($$value) {
								$.set(billingBudget, $$value, true);
							}
						});
					};

					var alternate = ($$anchor) => {
						PlanComparisonBox($$anchor, {});
					};

					$.if(node_17, ($$render) => {
						if ($.get(selectedPlan).supportsCredits) $$render(consequent_3); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_17);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_20 = root_1();
				var node_18 = $.first_child(fragment_20);

				Button(node_18, {
					fullWidthMobile: true,
					secondary: true,
					$$events: { click: () => $.set(showExitModal, true) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Cancel');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_19 = $.sibling(node_18, 2);

				Button(node_19, {
					fullWidthMobile: true,
					get disabled() {
						return $isSubmitting();
					},
					$$events: { click: () => $.get(formComponent).triggerSubmit() },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Create organization');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_20);
			}
		}
	});

	var node_20 = $.sibling(node, 2);

	ValidateCreditModal(node_20, {
		isNewOrg: true,
		get show() {
			return $.get(showCreditModal);
		},

		set show($$value) {
			$.set(showCreditModal, $$value, true);
		},

		get couponData() {
			return $.get(selectedCoupon);
		},

		set couponData($$value) {
			$.set(selectedCoupon, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}