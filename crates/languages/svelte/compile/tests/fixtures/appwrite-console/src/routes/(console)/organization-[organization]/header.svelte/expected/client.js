import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { base, resolve } from '$app/paths';
import { page } from '$app/state';
import { AvatarGroup, Tab, Tabs } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { toLocaleDate } from '$lib/helpers/date';
import { BODY_TOOLTIP_MAX_WIDTH, BODY_TOOLTIP_WRAPPER_STYLE } from '$lib/helpers/tooltipContent';
import { isTabSelected } from '$lib/helpers/load';
import { Cover } from '$lib/layout';
import { daysLeftInTrial, getServiceLimit, readOnly } from '$lib/stores/billing';
import { members, newMemberModal, newOrgModal } from '$lib/stores/organization';

import {
	canSeeBilling,
	canSeeProjects,
	canSeeTeams,
	isBilling,
	isOwner
} from '$lib/stores/roles';

import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
import { IconPlus, IconPlusSm } from '@appwrite.io/pink-icons-svelte';
import { Badge, Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
import { BillingPlanGroup } from '@appwrite.io/console';
import { IconsMap } from '$lib/helpers/program';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<a class="is-not-mobile"><!></a>`);
var root_4 = $.from_html(`<div><!></div>`);
var root_5 = $.from_html(`<div slot="tooltip"> </div>`);
var root_6 = $.from_html(`<!> <div class="u-margin-inline-start-auto"><!></div>`, 1);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $readOnly = () => $.store_get(readOnly, '$readOnly', $$stores);
	const $members = () => $.store_get(members, '$members', $$stores);
	const $canSeeProjects = () => $.store_get(canSeeProjects, '$canSeeProjects', $$stores);
	const $canSeeTeams = () => $.store_get(canSeeTeams, '$canSeeTeams', $$stores);
	const $isOwner = () => $.store_get(isOwner, '$isOwner', $$stores);
	const $isBilling = () => $.store_get(isBilling, '$isBilling', $$stores);
	const $canSeeBilling = () => $.store_get(canSeeBilling, '$canSeeBilling', $$stores);
	const $daysLeftInTrial = () => $.store_get(daysLeftInTrial, '$daysLeftInTrial', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let areMembersLimited = $.state(false);

	$.user_effect(() => {
		const limit = getServiceLimit('members', null, page.data.currentPlan) || Infinity;
		const isLimited = limit !== 0 && limit < Infinity;

		$.set(areMembersLimited, isCloud && ($readOnly() && !GRACE_PERIOD_OVERRIDE || isLimited && $members()?.total >= limit), true);
	});

	const program = $.derived(() => page.data.program);
	const organization = $.derived(() => page.data.organization);

	const path = $.derived(() => {
		return resolve('/(console)/organization-[organization]', { organization: $.get(organization).$id });
	});

	const tabs = $.derived(() => [
		{
			href: $.get(path),
			title: 'Projects',
			event: 'projects',
			hasChildren: true,
			disabled: !$canSeeProjects()
		},

		{
			href: `${$.get(path)}/domains`,
			event: 'domains',
			title: 'Domains',
			disabled: !isCloud
		},

		{
			href: `${$.get(path)}/members`,
			title: 'Members',
			event: 'members',
			hasChildren: true,
			disabled: !$canSeeTeams()
		},

		{
			href: `${$.get(path)}/usage`,
			event: 'usage',
			title: 'Usage',
			hasChildren: true,
			disabled: !(isCloud && ($isOwner() || $isBilling()) && !page.data.currentPlan?.usagePerProject)
		},

		{
			href: `${$.get(path)}/billing`,
			event: 'billing',
			title: 'Billing',
			disabled: !(isCloud && $canSeeBilling())
		},

		{
			href: `${$.get(path)}/settings`,
			event: 'settings',
			title: 'Settings',
			disabled: !$isOwner()
		}
	].filter((tab) => !tab.disabled));

	const avatars = $.derived(() => $members().memberships?.map((m) => m.userName || m.userEmail) ?? []);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_6 = ($$anchor) => {
			Cover($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Tabs($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, () => $.get(tabs), $.index, ($$anchor, tab) => {
								{
									let $0 = $.derived(() => isTabSelected($.get(tab), page.url.pathname, $.get(path), $.get(tabs)));

									Tab($$anchor, {
										get href() {
											return $.get(tab).href;
										},

										get selected() {
											return $.get($0);
										},

										get event() {
											return $.get(tab).event;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $.get(tab).title));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								}
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},

				$$slots: {
					default: true,
					header: ($$anchor, $$slotProps) => {
						var fragment_6 = root_6();
						var node_2 = $.first_child(fragment_6);

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								direction: 'row',
								alignItems: 'center',
								gap: 'm',
								class: 'u-min-width-0',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();
									var node_3 = $.first_child(fragment_7);

									$.component(node_3, () => Typography.Title, ($$anchor, Typography_Title) => {
										Typography_Title($$anchor, {
											color: '--fgcolor-neutral-primary',
											size: 'xl',
											truncate: true,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, $.get(organization).name));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									{
										var consequent_3 = ($$anchor) => {
											var fragment_9 = root_1();
											var node_5 = $.first_child(fragment_9);

											{
												var consequent = ($$anchor) => {
													Badge($$anchor, {
														variant: 'secondary',
														get content() {
															return $.get(program).tag;
														},

														$$slots: {
															start: ($$anchor, $$slotProps) => {
																Icon($$anchor, {
																	get icon() {
																		return IconsMap[$.get(program).icon];
																	},
																	size: 's',
																	slot: 'start'
																});
															}
														}
													});
												};

												var consequent_1 = ($$anchor) => {
													Badge($$anchor, { variant: 'secondary', content: 'Free' });
												};

												$.if(node_5, ($$render) => {
													if ($.get(program) && $.get(program).tag) $$render(consequent); else if ($.get(organization)?.billingPlanDetails.group === BillingPlanGroup.Starter) $$render(consequent_1, 1);
												});
											}

											var node_6 = $.sibling(node_5, 2);

											{
												var consequent_2 = ($$anchor) => {
													Tooltip($$anchor, {
														get maxWidth() {
															return BODY_TOOLTIP_MAX_WIDTH;
														},

														children: ($$anchor, $$slotProps) => {
															Badge($$anchor, { variant: 'secondary', content: 'Trial' });
														},

														$$slots: {
															default: true,
															tooltip: ($$anchor, $$slotProps) => {
																var div = root();
																var text_2 = $.only_child(div, true);

																$.template_effect(
																	($0) => {
																		$.set_style(div, BODY_TOOLTIP_WRAPPER_STYLE);
																		$.set_text(text_2, $0);
																	},
																	[
																		() => `Your trial ends on ${toLocaleDate($.get(organization).billingStartDate)}. ${$daysLeftInTrial()} days remaining.`
																	]
																);

																$.append($$anchor, div);
															}
														}
													});
												};

												$.if(node_6, ($$render) => {
													if ($.get(organization)?.billingTrialStartDate && $daysLeftInTrial() > 0 && $.get(organization).billingPlanDetails.trial && $.get(organization)?.billingTrialDays) $$render(consequent_2);
												});
											}

											$.append($$anchor, fragment_9);
										};

										$.if(node_4, ($$render) => {
											if (isCloud) $$render(consequent_3);
										});
									}

									var node_7 = $.sibling(node_4, 2);

									Button(node_7, {
										secondary: true,
										icon: true,
										size: 'xs',
										$$events: {
											click: () => isCloud
												? goto(`${base}/create-organization`)
												: newOrgModal.set(true)
										},

										children: ($$anchor, $$slotProps) => {
											Icon($$anchor, {
												get icon() {
													return IconPlusSm;
												},
												size: 'm'
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						var div_1 = $.sibling(node_2, 2);
						var node_8 = $.child(div_1);

						$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								direction: 'row',
								alignItems: 'center',
								gap: 'xl',
								children: ($$anchor, $$slotProps) => {
									var fragment_16 = root_1();
									var node_9 = $.first_child(fragment_16);

									{
										var consequent_4 = ($$anchor) => {
											var a = root_3();
											var node_10 = $.child(a);

											{
												let $0 = $.derived(() => $members()?.total ?? 0);

												AvatarGroup(node_10, {
													size: 'xs',
													get avatars() {
														return $.get(avatars);
													},

													get total() {
														return $.get($0);
													}
												});
											}

											$.reset(a);
											$.template_effect(() => $.set_attribute(a, 'href', `${$.get(path)}/members`));
											$.append($$anchor, a);
										};

										$.if(node_9, ($$render) => {
											if ($members().total > 1) $$render(consequent_4);
										});
									}

									var node_11 = $.sibling(node_9, 2);

									{
										var consequent_5 = ($$anchor) => {
											{
												let $0 = $.derived(() => !$.get(areMembersLimited));

												Tooltip($$anchor, {
													get disabled() {
														return $.get($0);
													},
													placement: 'bottom-end',
													get maxWidth() {
														return BODY_TOOLTIP_MAX_WIDTH;
													},

													children: ($$anchor, $$slotProps) => {
														var div_2 = root_4();
														var node_12 = $.child(div_2);

														Button(node_12, {
															secondary: true,
															size: 's',
															get disabled() {
																return $.get(areMembersLimited);
															},
															$$events: { click: () => newMemberModal.set(true) },
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Invite');

																$.append($$anchor, text_3);
															},

															$$slots: {
																default: true,
																start: ($$anchor, $$slotProps) => {
																	Icon($$anchor, {
																		get icon() {
																			return IconPlus;
																		},
																		size: 's',
																		slot: 'start'
																	});
																}
															}
														});

														$.reset(div_2);
														$.append($$anchor, div_2);
													},

													$$slots: {
														default: true,
														tooltip: ($$anchor, $$slotProps) => {
															var div_3 = root_5();
															var text_4 = $.only_child(div_3, true);

															$.template_effect(() => {
																$.set_style(div_3, BODY_TOOLTIP_WRAPPER_STYLE);

																$.set_text(text_4, !($.get(organization)?.billingPlanDetails?.addons?.seats?.supported ?? true)
																	? 'Upgrade to add more members'
																	: `You've reached the members limit for the ${$.get(organization)?.billingPlanDetails.name} plan`);
															});

															$.append($$anchor, div_3);
														}
													}
												});
											}
										};

										$.if(node_11, ($$render) => {
											if ($isOwner()) $$render(consequent_5);
										});
									}

									$.append($$anchor, fragment_16);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_1);
						$.append($$anchor, fragment_6);
					}
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(organization)?.$id) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}