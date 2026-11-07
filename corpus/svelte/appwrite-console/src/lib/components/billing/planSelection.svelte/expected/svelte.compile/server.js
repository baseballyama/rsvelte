import * as $ from 'svelte/internal/server';
import { LabelCard } from '..';
import { page } from '$app/state';
import { formatCurrency } from '$lib/helpers/numbers';
import { billingIdToPlan } from '$lib/stores/billing';
import { currentPlan, organization } from '$lib/stores/organization';
import { BillingPlanGroup } from '@appwrite.io/console';
import { Badge, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';

export default function PlanSelection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			isNewOrg = false,
			selfService = true,
			anyOrgFree = false,
			selectedBillingPlan = void 0
		} = $$props;

		let selectedPlan = selectedBillingPlan.$id;
		const visiblePlans = $.derived(() => Object.values(page.data.plans.plans));
		const currentPlanInList = $.derived(() => visiblePlans().some((plan) => plan.$id === $.store_get($$store_subs ??= {}, '$currentPlan', currentPlan)?.$id));

		function shouldShowTooltip(plan) {
			if (plan.group !== BillingPlanGroup.Starter) return true;
			if (!anyOrgFree) return true;

			// Hide only when upgrading from Free (current org on Free, user selected Pro)
			if ($.store_get($$store_subs ??= {}, '$organization', organization)?.billingPlanId === plan.$id && selectedPlan !== plan.$id) return true;

			return false;
		}

		function shouldDisable(plan) {
			return plan.group === BillingPlanGroup.Starter && anyOrgFree;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Layout.Stack) {
				$$renderer.push('<!--[-->');

				Layout.Stack($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(visiblePlans());

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let plan = each_array[$$index];

							Tooltip($$renderer, {
								disabled: shouldShowTooltip(plan),
								maxWidth: 'fit-content',
								children: ($$renderer) => {
									LabelCard($$renderer, {
										name: 'plan',
										disabled: !selfService || shouldDisable(plan),
										value: plan.$id,
										title: plan.name,
										get group() {
											return selectedPlan;
										},

										set group($$value) {
											selectedPlan = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (Typography.Caption) {
												$$renderer.push('<!--[-->');

												Typography.Caption($$renderer, {
													variant: '400',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(plan.desc)}`);
													},
													$$slots: { default: true }
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
													children: ($$renderer) => {
														const isZeroPrice = (plan.price ?? 0) <= 0;
														const price = formatCurrency(plan.price ?? 0);

														$$renderer.push(`<!---->${$.escape(isZeroPrice ? price : `${price} per month + usage`)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},

										$$slots: {
											default: true,
											action: ($$renderer) => {
												{
													if ($.store_get($$store_subs ??= {}, '$organization', organization)?.billingPlanId === plan.$id && !isNewOrg) {
														$$renderer.push('<!--[0-->');
														Badge($$renderer, { variant: 'secondary', size: 'xs', content: 'Current plan' });
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												}
											}
										}
									});
								},

								$$slots: {
									default: true,
									tooltip: ($$renderer) => {
										{
											$$renderer.push(`Only 1 free organization is allowed per account.`);
										}
									}
								}
							});
						}

						$$renderer.push(`<!--]--> `);

						if ($.store_get($$store_subs ??= {}, '$currentPlan', currentPlan) && !currentPlanInList()) {
							$$renderer.push('<!--[0-->');

							LabelCard($$renderer, {
								name: 'plan',
								value: $.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).$id,
								title: $.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).name,
								get group() {
									return selectedPlan;
								},

								set group($$value) {
									selectedPlan = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Typography.Caption) {
										$$renderer.push('<!--[-->');

										Typography.Caption($$renderer, {
											variant: '400',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).desc)}`);
											},
											$$slots: { default: true }
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
											children: ($$renderer) => {
												const isZeroPrice = ($.store_get($$store_subs ??= {}, '$currentPlan', currentPlan)?.price ?? 0) <= 0;
												const price = formatCurrency($.store_get($$store_subs ??= {}, '$currentPlan', currentPlan)?.price ?? 0);

												$$renderer.push(`<!---->${$.escape(isZeroPrice ? price : `${price} per month + usage`)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},

								$$slots: {
									default: true,
									action: ($$renderer) => {
										{
											if ($.store_get($$store_subs ??= {}, '$organization', organization)?.billingPlanId === $.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).$id && !isNewOrg) {
												$$renderer.push('<!--[0-->');
												Badge($$renderer, { variant: 'secondary', size: 'xs', content: 'Current plan' });
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										}
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { selectedBillingPlan });
	});
}