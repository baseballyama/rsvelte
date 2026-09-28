import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { formatNum } from '$lib/helpers/string';
import { BillingPlanGroup } from '@appwrite.io/console';
import { Card, Layout, Tabs, Typography } from '@appwrite.io/pink-svelte';
import { getBasePlanFromGroup, planHasGroup, plansInfo } from '$lib/stores/billing';

export default function PlanComparisonBox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { downgrade = false } = $$props;
		let selectedTab = getBasePlanFromGroup(BillingPlanGroup.Starter).$id;
		const currentPlan = $.derived(() => $.store_get($$store_subs ??= {}, '$plansInfo', plansInfo).get(selectedTab));

		const visiblePlans = $.derived(() => {
			return page.data.plans.plans.filter((plan) => plan.group !== BillingPlanGroup.Scale);
		});

		const uniquePlans = $.derived(() => {
			const map = new Map(visiblePlans().map((p) => [p.group ?? p.$id, p]));

			return [...map.values()];
		});

		function pluralize(count, singular, plural) {
			if (count === 1) return singular;

			return plural ?? `${singular}s`;
		}

		function appwritePlanView($$renderer) {
			if (planHasGroup(selectedTab, BillingPlanGroup.Starter)) {
				$$renderer.push('<!--[0-->');

				if (downgrade) {
					$$renderer.push(`<!--[0--><ul class="u-margin-block-start-8 list u-gap-4 u-small"><li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text">Limited to ${$.escape(currentPlan().databases)}
                        ${$.escape(pluralize(currentPlan().databases, 'Database'))}, ${$.escape(currentPlan().buckets)}
                        ${$.escape(pluralize(currentPlan().buckets, 'Bucket'))}, ${$.escape(currentPlan().functions)}
                        ${$.escape(pluralize(currentPlan().functions, 'Function'))} per project</span></li> <li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text">Limited to 1 organization member</span></li> <li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text">${$.escape(currentPlan().bandwidth)}GB bandwidth</span></li> <li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text">${$.escape(currentPlan().storage)}GB storage</span></li> <li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text">${$.escape(formatNum(currentPlan().executions))} executions</span></li> `);

					if (currentPlan().domains > 0) {
						$$renderer.push(`<!--[0--><li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text">Limited to ${$.escape(currentPlan().domains)} custom ${$.escape(pluralize(currentPlan().domains, 'domain'))}
                            per project</span></li>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></ul>`);
				} else {
					$$renderer.push(`<!--[-1--><ul class="un-order-list"><li>Limited to ${$.escape(currentPlan().databases)}
                    ${$.escape(pluralize(currentPlan().databases, 'Database'))}, ${$.escape(currentPlan().buckets)}
                    ${$.escape(pluralize(currentPlan().buckets, 'Bucket'))}, ${$.escape(currentPlan().functions)}
                    ${$.escape(pluralize(currentPlan().functions, 'Function'))} per project</li> <li>Limited to 1 organization member</li> <li>Limited to ${$.escape(currentPlan().bandwidth)}GB bandwidth</li> <li>Limited to ${$.escape(currentPlan().storage)}GB storage</li> <li>Limited to ${$.escape(formatNum(currentPlan().executions))} executions</li> `);

					if (currentPlan().domains > 0) {
						$$renderer.push(`<!--[0--><li>Limited to ${$.escape(currentPlan().domains)} custom ${$.escape(pluralize(currentPlan().domains, 'domain'))} per project</li>`);
					} else {
						$$renderer.push(`<!--[-1--><li>Unlimited custom domains</li>`);
					}

					$$renderer.push(`<!--]--></ul>`);
				}

				$$renderer.push(`<!--]-->`);
			} else if (planHasGroup(selectedTab, BillingPlanGroup.Pro)) {
				$$renderer.push('<!--[1-->');

				if (Typography.Text) {
					$$renderer.push('<!--[-->');

					Typography.Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Everything in the Free plan, plus:`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <ul class="un-order-list"><li>Unlimited databases, buckets, functions, and custom domains</li> <li>Unlimited seats</li> <li>${$.escape(currentPlan().bandwidth)}GB bandwidth</li> <li>${$.escape(currentPlan().storage)}GB storage</li> <li>${$.escape(formatNum(currentPlan().executions))} executions</li> <li>Email support</li></ul>`);
			} else if (planHasGroup(selectedTab, BillingPlanGroup.Scale)) {
				$$renderer.push('<!--[2-->');

				if (Typography.Text) {
					$$renderer.push('<!--[-->');

					Typography.Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Everything in the Pro plan, plus:`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <ul class="un-order-list"><li>Unlimited seats</li> <li>Organization roles</li> <li>SOC-2, HIPAA compliance</li> <li>SSO <span class="inline-tag">Coming soon</span></li> <li>Priority support</li></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		if (Card.Base) {
			$$renderer.push('<!--[-->');

			Card.Base($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							children: ($$renderer) => {
								if (Tabs.Root) {
									$$renderer.push('<!--[-->');

									Tabs.Root($$renderer, {
										stretch: true,
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$renderer, { root }) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(uniquePlans());

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let plan = each_array[$$index];

													if (Tabs.Item.Button) {
														$$renderer.push('<!--[-->');

														Tabs.Item.Button($$renderer, {
															root,
															active: selectedTab === plan.$id,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(plan.name)}`);
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
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										variant: 'm-600',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(currentPlan().name)} plan`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);
								appwritePlanView($$renderer);
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}