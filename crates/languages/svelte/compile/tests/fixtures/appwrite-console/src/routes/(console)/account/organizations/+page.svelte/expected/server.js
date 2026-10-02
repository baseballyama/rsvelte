import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

import {
	GridItem1,
	Empty,
	AvatarGroup,
	CardContainer,
	PaginationWithLimit
} from '$lib/components';

import { Button } from '$lib/elements/forms';
import { Container } from '$lib/layout';
import CreateOrganization from '../../createOrganization.svelte';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Badge, Skeleton } from '@appwrite.io/pink-svelte';
import { daysLeftInTrial, billingIdToPlan } from '$lib/stores/billing';
import { toLocaleDate } from '$lib/helpers/date';
import { BODY_TOOLTIP_MAX_WIDTH, BODY_TOOLTIP_WRAPPER_STYLE } from '$lib/helpers/tooltipContent';
import { goto } from '$app/navigation';
import { Icon, Tooltip, Typography } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		let addOrganization = false;

		async function getMemberships(teamId) {
			const memberships = await sdk.forConsole.teams.listMemberships({ teamId });

			return memberships.memberships.map((team) => team.userName || team.userEmail);
		}

		async function getPlanName(billingPlan) {
			if (!billingPlan) return 'Unknown';

			// For known plans, use tierToPlan
			const tierData = billingIdToPlan(billingPlan);

			// If it's not a custom plan, or we got a non-custom result, return the name
			if (tierData.name !== 'Custom') {
				return tierData.name;
			}

			// For custom plans, fetch from API
			try {
				const plan = await sdk.forConsole.console.getPlan({ planId: billingPlan });

				return plan.name;
			} catch(error) {
				// Fallback to 'Custom' if fetch fails
				return 'Custom';
			}
		}

		function isOrganizationOnTrial(organization) {
			if (!organization?.billingTrialStartDate) return false;
			if ($.store_get($$store_subs ??= {}, '$daysLeftInTrial', daysLeftInTrial) <= 0) return false;
			if (!organization.billingPlanDetails.trial) return false;

			return !!organization?.billingTrialDays;
		}

		function isNonPayingOrganization(organization) {
			// plan doesn't require payments, it is a non-paying org!
			return !organization?.billingPlanDetails.requiresPaymentMethod;
		}

		function isPayingOrganization(team) {
			const isPayingOrganization = isCloudOrg(team) && !isOrganizationOnTrial(team) && !isNonPayingOrganization(team);

			if (isPayingOrganization) return team; else return null;
		}

		function isCloudOrg(data) {
			return isCloud && 'billingPlanId' in data;
		}

		function createOrg() {
			if (isCloud) {
				goto(`${base}/create-organization`);
			} else addOrganization = true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="u-flex u-gap-12 common-section u-main-space-between">`);

					if (Typography.Title) {
						$$renderer.push('<!--[-->');

						Typography.Title($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Organizations`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					Button($$renderer, {
						event: 'create_organization',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Create organization`);
						},

						$$slots: {
							default: true,
							start: ($$renderer) => {
								Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
							}
						}
					});

					$$renderer.push(`<!----></div> `);

					if (data.organizations.teams.length) {
						$$renderer.push('<!--[0-->');

						CardContainer($$renderer, {
							event: 'organization',
							offset: data.offset,
							disableEmpty: false,
							total: data.organizations.total,
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(data.organizations.teams);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let organization = each_array[$$index];
									const avatarList = getMemberships(organization.$id);
									const payingOrg = isPayingOrganization(organization);
									const planName = isCloudOrg(organization) ? getPlanName(organization.billingPlanId) : null;

									GridItem1($$renderer, {
										href: `${base}/organization-${organization.$id}`,
										children: ($$renderer) => {
											$.await(
												$$renderer,
												avatarList,
												() => {
													Skeleton($$renderer, { width: 40, height: 40, variant: 'circle' });
												},
												(avatars) => {
													AvatarGroup($$renderer, { avatars });
												}
											);

											$$renderer.push(`<!--]-->`);
										},

										$$slots: {
											default: true,
											eyebrow: ($$renderer) => {
												{
													$$renderer.push(`${$.escape(organization?.total)}
                        ${$.escape(organization?.total > 1 ? 'members' : 'member')}`);
												}
											},

											title: ($$renderer) => {
												{
													$$renderer.push(`${$.escape(organization.name)}`);
												}
											},

											status: ($$renderer) => {
												{
													if (isCloudOrg(organization)) {
														$$renderer.push('<!--[0-->');

														if (isNonPayingOrganization(organization)) {
															$$renderer.push('<!--[0-->');

															if (planName) {
																$$renderer.push('<!--[0-->');

																$.await(
																	$$renderer,
																	planName,
																	() => {
																		Skeleton($$renderer, { width: 30, height: 20, variant: 'line' });
																	},
																	(name) => {
																		Tooltip($$renderer, {
																			maxWidth: BODY_TOOLTIP_MAX_WIDTH,
																			children: ($$renderer) => {
																				Badge($$renderer, { size: 'xs', variant: 'secondary', content: name });
																			},

																			$$slots: {
																				default: true,
																				tooltip: ($$renderer) => {
																					$$renderer.push(`<div slot="tooltip"${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE)}>You are limited to 1 free organization per account</div>`);
																				}
																			}
																		});
																	}
																);

																$$renderer.push(`<!--]-->`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]-->`);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> `);

														if (isOrganizationOnTrial(organization)) {
															$$renderer.push('<!--[0-->');

															Tooltip($$renderer, {
																maxWidth: BODY_TOOLTIP_MAX_WIDTH,
																children: ($$renderer) => {
																	$$renderer.push(`<div class="u-flex u-cross-center">`);

																	Badge($$renderer, {
																		class: 'eyebrow-heading-3',
																		variant: 'secondary',
																		content: 'TRIAL'
																	});

																	$$renderer.push(`<!----></div>`);
																},

																$$slots: {
																	default: true,
																	tooltip: ($$renderer) => {
																		$$renderer.push(`<div slot="tooltip"${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE)}>${$.escape(`Your trial ends on ${toLocaleDate(organization.billingStartDate)}. ${$.store_get($$store_subs ??= {}, '$daysLeftInTrial', daysLeftInTrial)} days remaining.`)}</div>`);
																	}
																}
															});
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--> `);

														if (payingOrg) {
															$$renderer.push('<!--[0-->');

															$.await(
																$$renderer,
																planName,
																() => {
																	Skeleton($$renderer, { width: 30, height: 20, variant: 'line' });
																},
																(name) => {
																	Badge($$renderer, {
																		size: 'xs',
																		type: 'success',
																		variant: 'secondary',
																		content: name
																	});
																}
															);

															$$renderer.push(`<!--]-->`);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]-->`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												}
											}
										}
									});
								}

								$$renderer.push(`<!--]-->`);
							},

							$$slots: {
								default: true,
								empty: ($$renderer) => {
									{
										$$renderer.push(`<p>Create a new organization</p>`);
									}
								}
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Empty($$renderer, {
							single: true,
							target: 'organization',
							children: ($$renderer) => {
								$$renderer.push(`<p>Create a new organization</p>`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--> `);

					PaginationWithLimit($$renderer, {
						name: 'Organizations',
						limit: data.limit,
						offset: data.offset,
						total: data.organizations.total
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CreateOrganization($$renderer, {
				get show() {
					return addOrganization;
				},

				set show($$value) {
					addOrganization = $$value;
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