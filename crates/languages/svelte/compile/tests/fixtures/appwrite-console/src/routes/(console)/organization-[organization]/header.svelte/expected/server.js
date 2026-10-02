import * as $ from 'svelte/internal/server';
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

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let areMembersLimited = false;
		const program = $.derived(() => page.data.program);
		const organization = $.derived(() => page.data.organization);

		const path = $.derived(() => {
			return resolve('/(console)/organization-[organization]', { organization: organization().$id });
		});

		const tabs = $.derived(() => [
			{
				href: path(),
				title: 'Projects',
				event: 'projects',
				hasChildren: true,
				disabled: !$.store_get($$store_subs ??= {}, '$canSeeProjects', canSeeProjects)
			},

			{
				href: `${path()}/domains`,
				event: 'domains',
				title: 'Domains',
				disabled: !isCloud
			},

			{
				href: `${path()}/members`,
				title: 'Members',
				event: 'members',
				hasChildren: true,
				disabled: !$.store_get($$store_subs ??= {}, '$canSeeTeams', canSeeTeams)
			},

			{
				href: `${path()}/usage`,
				event: 'usage',
				title: 'Usage',
				hasChildren: true,
				disabled: !(isCloud && ($.store_get($$store_subs ??= {}, '$isOwner', isOwner) || $.store_get($$store_subs ??= {}, '$isBilling', isBilling)) && !page.data.currentPlan?.usagePerProject)
			},

			{
				href: `${path()}/billing`,
				event: 'billing',
				title: 'Billing',
				disabled: !(isCloud && $.store_get($$store_subs ??= {}, '$canSeeBilling', canSeeBilling))
			},

			{
				href: `${path()}/settings`,
				event: 'settings',
				title: 'Settings',
				disabled: !$.store_get($$store_subs ??= {}, '$isOwner', isOwner)
			}
		].filter((tab) => !tab.disabled));

		const avatars = $.derived(() => $.store_get($$store_subs ??= {}, '$members', members).memberships?.map((m) => m.userName || m.userEmail) ?? []);

		if (organization()?.$id) {
			$$renderer.push('<!--[0-->');

			Cover($$renderer, {
				children: ($$renderer) => {
					Tabs($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(tabs());

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let tab = each_array[$$index];

								Tab($$renderer, {
									href: tab.href,
									selected: isTabSelected(tab, page.url.pathname, path(), tabs()),
									event: tab.event,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(tab.title)}`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},

				$$slots: {
					default: true,
					header: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									alignItems: 'center',
									gap: 'm',
									class: 'u-min-width-0',
									children: ($$renderer) => {
										if (Typography.Title) {
											$$renderer.push('<!--[-->');

											Typography.Title($$renderer, {
												color: '--fgcolor-neutral-primary',
												size: 'xl',
												truncate: true,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(organization().name)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (isCloud) {
											$$renderer.push('<!--[0-->');

											if (program() && program().tag) {
												$$renderer.push('<!--[0-->');

												Badge($$renderer, {
													variant: 'secondary',
													content: program().tag,
													$$slots: {
														start: ($$renderer) => {
															Icon($$renderer, { icon: IconsMap[program().icon], size: 's', slot: 'start' });
														}
													}
												});
											} else if (organization()?.billingPlanDetails.group === BillingPlanGroup.Starter) {
												$$renderer.push('<!--[1-->');
												Badge($$renderer, { variant: 'secondary', content: 'Free' });
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											if (organization()?.billingTrialStartDate && $.store_get($$store_subs ??= {}, '$daysLeftInTrial', daysLeftInTrial) > 0 && organization().billingPlanDetails.trial && organization()?.billingTrialDays) {
												$$renderer.push('<!--[0-->');

												Tooltip($$renderer, {
													maxWidth: BODY_TOOLTIP_MAX_WIDTH,
													children: ($$renderer) => {
														Badge($$renderer, { variant: 'secondary', content: 'Trial' });
													},

													$$slots: {
														default: true,
														tooltip: ($$renderer) => {
															{
																$$renderer.push(`<div${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE)}>${$.escape(`Your trial ends on ${toLocaleDate(organization().billingStartDate)}. ${$.store_get($$store_subs ??= {}, '$daysLeftInTrial', daysLeftInTrial)} days remaining.`)}</div>`);
															}
														}
													}
												});
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										Button($$renderer, {
											secondary: true,
											icon: true,
											size: 'xs',
											children: ($$renderer) => {
												Icon($$renderer, { icon: IconPlusSm, size: 'm' });
											},
											$$slots: { default: true }
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

							$$renderer.push(` <div class="u-margin-inline-start-auto">`);

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									alignItems: 'center',
									gap: 'xl',
									children: ($$renderer) => {
										if ($.store_get($$store_subs ??= {}, '$members', members).total > 1) {
											$$renderer.push(`<!--[0--><a${$.attr('href', `${path()}/members`)} class="is-not-mobile">`);

											AvatarGroup($$renderer, {
												size: 'xs',
												avatars: avatars(),
												total: $.store_get($$store_subs ??= {}, '$members', members)?.total ?? 0
											});

											$$renderer.push(`<!----></a>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if ($.store_get($$store_subs ??= {}, '$isOwner', isOwner)) {
											$$renderer.push('<!--[0-->');

											Tooltip($$renderer, {
												disabled: !areMembersLimited,
												placement: 'bottom-end',
												maxWidth: BODY_TOOLTIP_MAX_WIDTH,
												children: ($$renderer) => {
													$$renderer.push(`<div>`);

													Button($$renderer, {
														secondary: true,
														size: 's',
														disabled: areMembersLimited,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Invite`);
														},

														$$slots: {
															default: true,
															start: ($$renderer) => {
																Icon($$renderer, { icon: IconPlus, size: 's', slot: 'start' });
															}
														}
													});

													$$renderer.push(`<!----></div>`);
												},

												$$slots: {
													default: true,
													tooltip: ($$renderer) => {
														$$renderer.push(`<div slot="tooltip"${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE)}>${$.escape(!(organization()?.billingPlanDetails?.addons?.seats?.supported ?? true)
															? 'Upgrade to add more members'
															: `You've reached the members limit for the ${organization()?.billingPlanDetails.name} plan`)}</div>`);
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

							$$renderer.push(`</div>`);
						}
					}
				}
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}