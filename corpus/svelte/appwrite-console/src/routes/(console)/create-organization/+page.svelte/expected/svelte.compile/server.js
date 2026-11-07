import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		let showExitModal = false;
		let selectedPlan = data.plan;
		let previousPage = resolve('/(console)');
		let selectedCoupon = data.coupon;
		let isSubmitting = writable(false);
		let formComponent = null;
		let name = null;
		let taxId = null;
		let collaborators = [];
		let paymentMethodId = null;
		let showCreditModal = false;
		let billingBudget = undefined;

		afterNavigate(({ from }) => {
			previousPage = from?.url?.pathname || previousPage;
		});

		onMount(async () => {
			if (page.url.searchParams.has('coupon')) {
				const coupon = page.url.searchParams.get('coupon');

				try {
					selectedCoupon = await sdk.forConsole.console.getCoupon({ couponId: coupon });
				} catch(e) {
					selectedCoupon = { code: null, status: null, credits: null };
				}
			}

			if (page.url.searchParams.has('name')) {
				name = page.url.searchParams.get('name');
			}

			if (page.url.searchParams.has('plan')) {
				const plan = page.url.searchParams.get('plan');

				if (plan) {
					selectedPlan = billingIdToPlan(plan);
				}
			}

			if (data?.hasFreeOrganizations || page.url.searchParams.has('type') && page.url.searchParams.get('type') === 'createPro') {
				selectedPlan = getBasePlanFromGroup(BillingPlanGroup.Pro);
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

				if (selectedPlan.group === BillingPlanGroup.Starter) {
					org = await sdk.forConsole.organizations.create({
						organizationId: ID.unique(),
						name,
						billingPlan: getBasePlanFromGroup(BillingPlanGroup.Starter).$id
					});
				} else {
					org = await sdk.forConsole.organizations.create({
						organizationId: ID.unique(),
						name,
						billingPlan: selectedPlan.$id,
						paymentMethodId,
						couponId: selectedCoupon?.code,
						invites: collaborators,
						budget: billingBudget,
						taxId
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

						params.append('invites', collaborators.join(','));

						const resolvedUrl = resolve('/(console)/create-organization');

						const outcome = await confirmPayment({
							clientSecret,
							paymentMethodId,
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

						await validate(org.organizationId, collaborators);
					}
				}

				trackEvent(Submit.OrganizationCreate, {
					plan: selectedPlan.name,
					budget_cap_enabled: billingBudget !== null,
					members_invited: collaborators?.length
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('16lisiw', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Create organization - Appwrite</title>`);
				});
			});

			Wizard($$renderer, {
				title: 'Create organization',
				href: previousPage,
				confirmExit: true,
				get showExitModal() {
					return showExitModal;
				},

				set showExitModal($$value) {
					showExitModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: create,
						get isSubmitting() {
							return isSubmitting;
						},

						set isSubmitting($$value) {
							isSubmitting = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xxl',
									children: ($$renderer) => {
										Fieldset($$renderer, {
											legend: 'Options',
											children: ($$renderer) => {
												InputText($$renderer, {
													label: 'Organization name',
													placeholder: 'Enter organization name',
													autofocus: true,
													id: 'name',
													required: true,
													get value() {
														return name;
													},

													set value($$value) {
														name = $$value;
														$$settled = false;
													}
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Fieldset($$renderer, {
											legend: 'Select plan',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														children: ($$renderer) => {
															if (Typography.Text) {
																$$renderer.push('<!--[-->');

																Typography.Text($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->For more details on our plans, visit our `);

																		if (Link.Anchor) {
																			$$renderer.push('<!--[-->');

																			Link.Anchor($$renderer, {
																				href: 'https://appwrite.io/pricing',
																				target: '_blank',
																				rel: 'noopener noreferrer',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->pricing page`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(`.`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															PlanSelection($$renderer, {
																isNewOrg: true,
																anyOrgFree: data.hasFreeOrganizations,
																get selectedBillingPlan() {
																	return selectedPlan;
																},

																set selectedBillingPlan($$value) {
																	selectedPlan = $$value;
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
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (selectedPlan.supportsCredits) {
											$$renderer.push('<!--[0-->');

											Fieldset($$renderer, {
												legend: 'Payment',
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 's',
															alignItems: 'flex-start',
															children: ($$renderer) => {
																SelectPaymentMethod($$renderer, {
																	methods: data.paymentMethods,
																	get value() {
																		return paymentMethodId;
																	},

																	set value($$value) {
																		paymentMethodId = $$value;
																		$$settled = false;
																	},

																	get taxId() {
																		return taxId;
																	},

																	set taxId($$value) {
																		taxId = $$value;
																		$$settled = false;
																	},

																	$$slots: {
																		actions: ($$renderer) => {
																			{
																				if (!selectedCoupon?.code && paymentMethodId) {
																					$$renderer.push('<!--[0-->');
																					Divider($$renderer, { vertical: true, style: 'height: 2rem;' });
																					$$renderer.push(`<!----> `);

																					Button($$renderer, {
																						compact: true,
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Add credits`);
																						},

																						$$slots: {
																							default: true,
																							start: ($$renderer) => {
																								Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
																							}
																						}
																					});

																					$$renderer.push(`<!---->`);
																				} else {
																					$$renderer.push('<!--[-1-->');
																				}

																				$$renderer.push(`<!--]-->`);
																			}
																		}
																	}
																});

																$$renderer.push(`<!----> `);

																if (!selectedCoupon?.code && !paymentMethodId) {
																	$$renderer.push('<!--[0-->');

																	Button($$renderer, {
																		compact: true,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Add credits`);
																		},

																		$$slots: {
																			default: true,
																			start: ($$renderer) => {
																				Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
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

											$$renderer.push(`<!----> `);

											Fieldset($$renderer, {
												legend: 'Invite members',
												children: ($$renderer) => {
													InputTags($$renderer, {
														label: 'Invite members by email',
														placeholder: 'Enter email address(es)',
														id: 'members',
														get tags() {
															return collaborators;
														},

														set tags($$value) {
															collaborators = $$value;
															$$settled = false;
														}
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
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
				},

				$$slots: {
					default: true,
					aside: ($$renderer) => {
						{
							if (selectedPlan.supportsCredits) {
								$$renderer.push('<!--[0-->');

								EstimatedTotalBox($$renderer, {
									billingPlan: selectedPlan,
									collaborators,
									get couponData() {
										return selectedCoupon;
									},

									set couponData($$value) {
										selectedCoupon = $$value;
										$$settled = false;
									},

									get billingBudget() {
										return billingBudget;
									},

									set billingBudget($$value) {
										billingBudget = $$value;
										$$settled = false;
									}
								});
							} else {
								$$renderer.push('<!--[-1-->');
								PlanComparisonBox($$renderer, {});
							}

							$$renderer.push(`<!--]-->`);
						}
					},

					footer: ($$renderer) => {
						{
							Button($$renderer, {
								fullWidthMobile: true,
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								fullWidthMobile: true,
								disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Create organization`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			ValidateCreditModal($$renderer, {
				isNewOrg: true,
				get show() {
					return showCreditModal;
				},

				set show($$value) {
					showCreditModal = $$value;
					$$settled = false;
				},

				get couponData() {
					return selectedCoupon;
				},

				set couponData($$value) {
					selectedCoupon = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
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