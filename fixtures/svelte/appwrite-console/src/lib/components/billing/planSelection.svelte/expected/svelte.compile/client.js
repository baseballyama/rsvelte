import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LabelCard } from '..';
import { page } from '$app/state';
import { formatCurrency } from '$lib/helpers/numbers';
import { billingIdToPlan } from '$lib/stores/billing';
import { currentPlan, organization } from '$lib/stores/organization';
import { BillingPlanGroup } from '@appwrite.io/console';
import { Badge, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function PlanSelection($$anchor, $$props) {
	$.push($$props, true);

	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];

	let isNewOrg = $.prop($$props, 'isNewOrg', 3, false),
		selfService = $.prop($$props, 'selfService', 3, true),
		anyOrgFree = $.prop($$props, 'anyOrgFree', 3, false),
		selectedBillingPlan = $.prop($$props, 'selectedBillingPlan', 15);

	let selectedPlan = $.state($.proxy(selectedBillingPlan().$id));
	const visiblePlans = $.derived(() => Object.values(page.data.plans.plans));
	const currentPlanInList = $.derived(() => $.get(visiblePlans).some((plan) => plan.$id === $currentPlan()?.$id));

	function shouldShowTooltip(plan) {
		if (plan.group !== BillingPlanGroup.Starter) return true;
		if (!anyOrgFree()) return true;

		// Hide only when upgrading from Free (current org on Free, user selected Pro)
		if ($organization()?.billingPlanId === plan.$id && $.get(selectedPlan) !== plan.$id) return true;

		return false;
	}

	function shouldDisable(plan) {
		return plan.group === BillingPlanGroup.Starter && anyOrgFree();
	}

	$.user_effect(() => {
		selectedBillingPlan(billingIdToPlan($.get(selectedPlan)));
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => $.get(visiblePlans), $.index, ($$anchor, plan) => {
					{
						let $0 = $.derived(() => shouldShowTooltip($.get(plan)));

						Tooltip($$anchor, {
							get disabled() {
								return $.get($0);
							},
							maxWidth: 'fit-content',
							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => !selfService() || shouldDisable($.get(plan)));

									LabelCard($$anchor, {
										name: 'plan',
										get disabled() {
											return $.get($0);
										},

										get value() {
											return $.get(plan).$id;
										},

										get title() {
											return $.get(plan).name;
										},

										get group() {
											return $.get(selectedPlan);
										},

										set group($$value) {
											$.set(selectedPlan, $$value, true);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_2 = $.first_child(fragment_4);

											$.component(node_2, () => Typography.Caption, ($$anchor, Typography_Caption) => {
												Typography_Caption($$anchor, {
													variant: '400',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text();

														$.template_effect(() => $.set_text(text, $.get(plan).desc));
														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											var node_3 = $.sibling(node_2, 2);

											$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
												Typography_Text($$anchor, {
													children: ($$anchor, $$slotProps) => {
														const isZeroPrice = $.derived(() => ($.get(plan).price ?? 0) <= 0);
														const price = $.derived(() => formatCurrency($.get(plan).price ?? 0));

														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, $.get(isZeroPrice) ? $.get(price) : `${$.get(price)} per month + usage`));
														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},

										$$slots: {
											default: true,
											action: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_4 = $.first_child(fragment_7);

												{
													var consequent = ($$anchor) => {
														Badge($$anchor, { variant: 'secondary', size: 'xs', content: 'Current plan' });
													};

													$.if(node_4, ($$render) => {
														if ($organization()?.billingPlanId === $.get(plan).$id && !isNewOrg()) $$render(consequent);
													});
												}

												$.append($$anchor, fragment_7);
											}
										}
									});
								}
							},

							$$slots: {
								default: true,
								tooltip: ($$anchor, $$slotProps) => {
									var text_2 = $.text('Only 1 free organization is allowed per account.');

									$.append($$anchor, text_2);
								}
							}
						});
					}
				});

				var node_5 = $.sibling(node_1, 2);

				{
					var consequent_2 = ($$anchor) => {
						LabelCard($$anchor, {
							name: 'plan',
							get value() {
								return $currentPlan().$id;
							},

							get title() {
								return $currentPlan().name;
							},

							get group() {
								return $.get(selectedPlan);
							},

							set group($$value) {
								$.set(selectedPlan, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root();
								var node_6 = $.first_child(fragment_10);

								$.component(node_6, () => Typography.Caption, ($$anchor, Typography_Caption_1) => {
									Typography_Caption_1($$anchor, {
										variant: '400',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text();

											$.template_effect(() => $.set_text(text_3, $currentPlan().desc));
											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text_1) => {
									Typography_Text_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											const isZeroPrice = $.derived(() => ($currentPlan()?.price ?? 0) <= 0);
											const price = $.derived(() => formatCurrency($currentPlan()?.price ?? 0));

											$.next();

											var text_4 = $.text();

											$.template_effect(() => $.set_text(text_4, $.get(isZeroPrice) ? $.get(price) : `${$.get(price)} per month + usage`));
											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_10);
							},

							$$slots: {
								default: true,
								action: ($$anchor, $$slotProps) => {
									var fragment_13 = $.comment();
									var node_8 = $.first_child(fragment_13);

									{
										var consequent_1 = ($$anchor) => {
											Badge($$anchor, { variant: 'secondary', size: 'xs', content: 'Current plan' });
										};

										$.if(node_8, ($$render) => {
											if ($organization()?.billingPlanId === $currentPlan().$id && !isNewOrg()) $$render(consequent_1);
										});
									}

									$.append($$anchor, fragment_13);
								}
							}
						});
					};

					$.if(node_5, ($$render) => {
						if ($currentPlan() && !$.get(currentPlanInList)) $$render(consequent_2);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}