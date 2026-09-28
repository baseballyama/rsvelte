import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div slot="tooltip">You are limited to 1 free organization per account</div>`);
var root_1 = $.from_html(`<div class="u-flex u-cross-center"><!></div>`);
var root_2 = $.from_html(`<div slot="tooltip"> </div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<p>Create a new organization</p>`);
var root_5 = $.from_html(`<div class="u-flex u-gap-12 common-section u-main-space-between"><!> <!></div> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $daysLeftInTrial = () => $.store_get(daysLeftInTrial, '$daysLeftInTrial', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let addOrganization = $.state(false);

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
		if ($daysLeftInTrial() <= 0) return false;
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
		} else $.set(addOrganization, true);
	}

	var fragment = root_6();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			$.component(node_1, () => Typography.Title, ($$anchor, Typography_Title) => {
				Typography_Title($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Organizations');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				event: 'create_organization',
				$$events: { click: createOrg },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Create organization');

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

			$.reset(div);

			var node_3 = $.sibling(div, 2);

			{
				var consequent_5 = ($$anchor) => {
					CardContainer($$anchor, {
						event: 'organization',
						get offset() {
							return $$props.data.offset;
						},
						disableEmpty: false,
						get total() {
							return $$props.data.organizations.total;
						},
						$$events: { click: createOrg },
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.each(node_4, 17, () => $$props.data.organizations.teams, $.index, ($$anchor, organization) => {
								const avatarList = $.derived(() => getMemberships($.get(organization).$id));
								const payingOrg = $.derived(() => isPayingOrganization($.get(organization)));
								const planName = $.derived(() => isCloudOrg($.get(organization)) ? getPlanName($.get(organization).billingPlanId) : null);

								{
									let $0 = $.derived(() => `${base}/organization-${$.get(organization).$id}`);

									GridItem1($$anchor, {
										get href() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_6 = $.comment();
											var node_5 = $.first_child(fragment_6);

											$.await(
												node_5,
												() => $.get(avatarList),
												($$anchor) => {
													Skeleton($$anchor, { width: 40, height: 40, variant: 'circle' });
												},
												($$anchor, avatars) => {
													AvatarGroup($$anchor, {
														get avatars() {
															return $.get(avatars);
														}
													});
												}
											);

											$.append($$anchor, fragment_6);
										},

										$$slots: {
											default: true,
											eyebrow: ($$anchor, $$slotProps) => {
												var text_2 = $.text();

												$.template_effect(() => $.set_text(text_2, `${$.get(organization)?.total ?? ''}
                        ${$.get(organization)?.total > 1 ? 'members' : 'member'}`));

												$.append($$anchor, text_2);
											},

											title: ($$anchor, $$slotProps) => {
												var text_3 = $.text();

												$.template_effect(() => $.set_text(text_3, $.get(organization).name));
												$.append($$anchor, text_3);
											},

											status: ($$anchor, $$slotProps) => {
												var fragment_11 = $.comment();
												var node_6 = $.first_child(fragment_11);

												{
													var consequent_4 = ($$anchor) => {
														var fragment_12 = root_3();
														var node_7 = $.first_child(fragment_12);

														{
															var consequent_1 = ($$anchor) => {
																var fragment_13 = $.comment();
																var node_8 = $.first_child(fragment_13);

																{
																	var consequent = ($$anchor) => {
																		var fragment_14 = $.comment();
																		var node_9 = $.first_child(fragment_14);

																		$.await(
																			node_9,
																			() => $.get(planName),
																			($$anchor) => {
																				Skeleton($$anchor, { width: 30, height: 20, variant: 'line' });
																			},
																			($$anchor, name) => {
																				Tooltip($$anchor, {
																					get maxWidth() {
																						return BODY_TOOLTIP_MAX_WIDTH;
																					},

																					children: ($$anchor, $$slotProps) => {
																						Badge($$anchor, {
																							size: 'xs',
																							variant: 'secondary',
																							get content() {
																								return $.get(name);
																							}
																						});
																					},

																					$$slots: {
																						default: true,
																						tooltip: ($$anchor, $$slotProps) => {
																							var div_1 = root();

																							$.template_effect(() => $.set_style(div_1, BODY_TOOLTIP_WRAPPER_STYLE));
																							$.append($$anchor, div_1);
																						}
																					}
																				});
																			}
																		);

																		$.append($$anchor, fragment_14);
																	};

																	$.if(node_8, ($$render) => {
																		if ($.get(planName)) $$render(consequent);
																	});
																}

																$.append($$anchor, fragment_13);
															};

															var d = $.derived(() => isNonPayingOrganization($.get(organization)));

															$.if(node_7, ($$render) => {
																if ($.get(d)) $$render(consequent_1);
															});
														}

														var node_10 = $.sibling(node_7, 2);

														{
															var consequent_2 = ($$anchor) => {
																Tooltip($$anchor, {
																	get maxWidth() {
																		return BODY_TOOLTIP_MAX_WIDTH;
																	},

																	children: ($$anchor, $$slotProps) => {
																		var div_2 = root_1();
																		var node_11 = $.child(div_2);

																		Badge(node_11, {
																			class: 'eyebrow-heading-3',
																			variant: 'secondary',
																			content: 'TRIAL'
																		});

																		$.reset(div_2);
																		$.append($$anchor, div_2);
																	},

																	$$slots: {
																		default: true,
																		tooltip: ($$anchor, $$slotProps) => {
																			var div_3 = root_2();
																			var text_4 = $.only_child(div_3, true);

																			$.template_effect(
																				($0) => {
																					$.set_style(div_3, BODY_TOOLTIP_WRAPPER_STYLE);
																					$.set_text(text_4, $0);
																				},
																				[
																					() => `Your trial ends on ${toLocaleDate($.get(organization).billingStartDate)}. ${$daysLeftInTrial()} days remaining.`
																				]
																			);

																			$.append($$anchor, div_3);
																		}
																	}
																});
															};

															var d_1 = $.derived(() => isOrganizationOnTrial($.get(organization)));

															$.if(node_10, ($$render) => {
																if ($.get(d_1)) $$render(consequent_2);
															});
														}

														var node_12 = $.sibling(node_10, 2);

														{
															var consequent_3 = ($$anchor) => {
																var fragment_19 = $.comment();
																var node_13 = $.first_child(fragment_19);

																$.await(
																	node_13,
																	() => $.get(planName),
																	($$anchor) => {
																		Skeleton($$anchor, { width: 30, height: 20, variant: 'line' });
																	},
																	($$anchor, name) => {
																		Badge($$anchor, {
																			size: 'xs',
																			type: 'success',
																			variant: 'secondary',
																			get content() {
																				return $.get(name);
																			}
																		});
																	}
																);

																$.append($$anchor, fragment_19);
															};

															$.if(node_12, ($$render) => {
																if ($.get(payingOrg)) $$render(consequent_3);
															});
														}

														$.append($$anchor, fragment_12);
													};

													var d_2 = $.derived(() => isCloudOrg($.get(organization)));

													$.if(node_6, ($$render) => {
														if ($.get(d_2)) $$render(consequent_4);
													});
												}

												$.append($$anchor, fragment_11);
											}
										}
									});
								}
							});

							$.append($$anchor, fragment_4);
						},

						$$slots: {
							default: true,
							empty: ($$anchor, $$slotProps) => {
								var p = root_4();

								$.append($$anchor, p);
							}
						}
					});
				};

				var alternate = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						target: 'organization',
						$$events: { click: createOrg },
						children: ($$anchor, $$slotProps) => {
							var p_1 = root_4();

							$.append($$anchor, p_1);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_3, ($$render) => {
					if ($$props.data.organizations.teams.length) $$render(consequent_5); else $$render(alternate, -1);
				});
			}

			var node_14 = $.sibling(node_3, 2);

			PaginationWithLimit(node_14, {
				name: 'Organizations',
				get limit() {
					return $$props.data.limit;
				},

				get offset() {
					return $$props.data.offset;
				},

				get total() {
					return $$props.data.organizations.total;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node, 2);

	CreateOrganization(node_15, {
		get show() {
			return $.get(addOrganization);
		},

		set show($$value) {
			$.set(addOrganization, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}