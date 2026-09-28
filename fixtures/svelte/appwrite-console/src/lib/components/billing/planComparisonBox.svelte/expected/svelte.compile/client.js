import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { formatNum } from '$lib/helpers/string';
import { BillingPlanGroup } from '@appwrite.io/console';
import { Card, Layout, Tabs, Typography } from '@appwrite.io/pink-svelte';
import { getBasePlanFromGroup, planHasGroup, plansInfo } from '$lib/stores/billing';

var root_1 = $.from_html(`<li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text"> </span></li>`);
var root_2 = $.from_html(`<ul class="u-margin-block-start-8 list u-gap-4 u-small"><li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text"> </span></li> <li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text">Limited to 1 organization member</span></li> <li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text"> </span></li> <li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text"> </span></li> <li class="list-item u-gap-4 u-cross-center"><span class="icon-arrow-down u-color-text-danger" aria-hidden="true"></span> <span class="text"> </span></li> <!></ul>`);
var root_3 = $.from_html(`<li> </li>`);
var root_4 = $.from_html(`<li>Unlimited custom domains</li>`);
var root_5 = $.from_html(`<ul class="un-order-list"><li> </li> <li>Limited to 1 organization member</li> <li> </li> <li> </li> <li> </li> <!></ul>`);
var root_6 = $.from_html(`<!> <ul class="un-order-list"><li>Unlimited databases, buckets, functions, and custom domains</li> <li>Unlimited seats</li> <li> </li> <li> </li> <li> </li> <li>Email support</li></ul>`, 1);
var root_7 = $.from_html(`<!> <ul class="un-order-list"><li>Unlimited seats</li> <li>Organization roles</li> <li>SOC-2, HIPAA compliance</li> <li>SSO <span class="inline-tag">Coming soon</span></li> <li>Priority support</li></ul>`, 1);
var root_8 = $.from_html(`<!> <!> <!>`, 1);

export default function PlanComparisonBox($$anchor, $$props) {
	$.push($$props, true);

	const $plansInfo = () => $.store_get(plansInfo, '$plansInfo', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const appwritePlanView = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_3 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_1 = ($$anchor) => {
						var ul = root_2();
						var li = $.child(ul);
						var span = $.sibling($.child(li), 2);
						var text = $.only_child(span);

						$.reset(li);

						var li_1 = $.sibling(li, 4);
						var span_1 = $.sibling($.child(li_1), 2);
						var text_1 = $.only_child(span_1);

						$.reset(li_1);

						var li_2 = $.sibling(li_1, 2);
						var span_2 = $.sibling($.child(li_2), 2);
						var text_2 = $.only_child(span_2);

						$.reset(li_2);

						var li_3 = $.sibling(li_2, 2);
						var span_3 = $.sibling($.child(li_3), 2);
						var text_3 = $.only_child(span_3);

						$.reset(li_3);

						var node_2 = $.sibling(li_3, 2);

						{
							var consequent = ($$anchor) => {
								var li_4 = root_1();
								var span_4 = $.sibling($.child(li_4), 2);
								var text_4 = $.only_child(span_4);

								$.reset(li_4);

								$.template_effect(
									($0) => $.set_text(text_4, `Limited to ${$.get(currentPlan).domains ?? ''} custom ${$0 ?? ''}
                            per project`),
									[() => pluralize($.get(currentPlan).domains, 'domain')]
								);

								$.append($$anchor, li_4);
							};

							$.if(node_2, ($$render) => {
								if ($.get(currentPlan).domains > 0) $$render(consequent);
							});
						}

						$.reset(ul);

						$.template_effect(
							($0, $1, $2, $3) => {
								$.set_text(text, `Limited to ${$.get(currentPlan).databases ?? ''}
                        ${$0 ?? ''}, ${$.get(currentPlan).buckets ?? ''}
                        ${$1 ?? ''}, ${$.get(currentPlan).functions ?? ''}
                        ${$2 ?? ''} per project`);

								$.set_text(text_1, `${$.get(currentPlan).bandwidth ?? ''}GB bandwidth`);
								$.set_text(text_2, `${$.get(currentPlan).storage ?? ''}GB storage`);
								$.set_text(text_3, `${$3 ?? ''} executions`);
							},
							[
								() => pluralize($.get(currentPlan).databases, 'Database'),
								() => pluralize($.get(currentPlan).buckets, 'Bucket'),
								() => pluralize($.get(currentPlan).functions, 'Function'),
								() => formatNum($.get(currentPlan).executions)
							]
						);

						$.append($$anchor, ul);
					};

					var alternate_1 = ($$anchor) => {
						var ul_1 = root_5();
						var li_5 = $.child(ul_1);
						var text_5 = $.only_child(li_5);
						var li_6 = $.sibling(li_5, 4);
						var text_6 = $.only_child(li_6);
						var li_7 = $.sibling(li_6, 2);
						var text_7 = $.only_child(li_7);
						var li_8 = $.sibling(li_7, 2);
						var text_8 = $.only_child(li_8);
						var node_3 = $.sibling(li_8, 2);

						{
							var consequent_2 = ($$anchor) => {
								var li_9 = root_3();
								var text_9 = $.only_child(li_9);

								$.template_effect(($0) => $.set_text(text_9, `Limited to ${$.get(currentPlan).domains ?? ''} custom ${$0 ?? ''} per project`), [() => pluralize($.get(currentPlan).domains, 'domain')]);
								$.append($$anchor, li_9);
							};

							var alternate = ($$anchor) => {
								var li_10 = root_4();

								$.append($$anchor, li_10);
							};

							$.if(node_3, ($$render) => {
								if ($.get(currentPlan).domains > 0) $$render(consequent_2); else $$render(alternate, -1);
							});
						}

						$.reset(ul_1);

						$.template_effect(
							($0, $1, $2, $3) => {
								$.set_text(text_5, `Limited to ${$.get(currentPlan).databases ?? ''}
                    ${$0 ?? ''}, ${$.get(currentPlan).buckets ?? ''}
                    ${$1 ?? ''}, ${$.get(currentPlan).functions ?? ''}
                    ${$2 ?? ''} per project`);

								$.set_text(text_6, `Limited to ${$.get(currentPlan).bandwidth ?? ''}GB bandwidth`);
								$.set_text(text_7, `Limited to ${$.get(currentPlan).storage ?? ''}GB storage`);
								$.set_text(text_8, `Limited to ${$3 ?? ''} executions`);
							},
							[
								() => pluralize($.get(currentPlan).databases, 'Database'),
								() => pluralize($.get(currentPlan).buckets, 'Bucket'),
								() => pluralize($.get(currentPlan).functions, 'Function'),
								() => formatNum($.get(currentPlan).executions)
							]
						);

						$.append($$anchor, ul_1);
					};

					$.if(node_1, ($$render) => {
						if (downgrade()) $$render(consequent_1); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_1);
			};

			var d = $.derived(() => planHasGroup($.get(selectedTab), BillingPlanGroup.Starter));

			var consequent_4 = ($$anchor) => {
				var fragment_2 = root_6();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text) => {
					Typography_Text($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Everything in the Free plan, plus:');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});
				});

				var ul_2 = $.sibling(node_4, 2);
				var li_11 = $.sibling($.child(ul_2), 4);
				var text_11 = $.only_child(li_11);
				var li_12 = $.sibling(li_11, 2);
				var text_12 = $.only_child(li_12);
				var li_13 = $.sibling(li_12, 2);
				var text_13 = $.only_child(li_13);

				$.next(2);
				$.reset(ul_2);

				$.template_effect(
					($0) => {
						$.set_text(text_11, `${$.get(currentPlan).bandwidth ?? ''}GB bandwidth`);
						$.set_text(text_12, `${$.get(currentPlan).storage ?? ''}GB storage`);
						$.set_text(text_13, `${$0 ?? ''} executions`);
					},
					[() => formatNum($.get(currentPlan).executions)]
				);

				$.append($$anchor, fragment_2);
			};

			var d_1 = $.derived(() => planHasGroup($.get(selectedTab), BillingPlanGroup.Pro));

			var consequent_5 = ($$anchor) => {
				var fragment_3 = root_7();
				var node_5 = $.first_child(fragment_3);

				$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text_1) => {
					Typography_Text_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('Everything in the Pro plan, plus:');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});
				});

				$.next(2);
				$.append($$anchor, fragment_3);
			};

			var d_2 = $.derived(() => planHasGroup($.get(selectedTab), BillingPlanGroup.Scale));

			$.if(node, ($$render) => {
				if ($.get(d)) $$render(consequent_3); else if ($.get(d_1)) $$render(consequent_4, 1); else if ($.get(d_2)) $$render(consequent_5, 2);
			});
		}

		$.append($$anchor, fragment);
	};

	let downgrade = $.prop($$props, 'downgrade', 3, false);
	let selectedTab = $.state($.proxy(getBasePlanFromGroup(BillingPlanGroup.Starter).$id));
	const currentPlan = $.derived(() => $plansInfo().get($.get(selectedTab)));

	const visiblePlans = $.derived(() => {
		return page.data.plans.plans.filter((plan) => plan.group !== BillingPlanGroup.Scale);
	});

	const uniquePlans = $.derived(() => {
		const map = new Map($.get(visiblePlans).map((p) => [p.group ?? p.$id, p]));

		return [...map.values()];
	});

	function pluralize(count, singular, plural) {
		if (count === 1) return singular;

		return plural ?? `${singular}s`;
	}

	var fragment_4 = $.comment();
	var node_6 = $.first_child(fragment_4);

	$.component(node_6, () => Card.Base, ($$anchor, Card_Base) => {
		Card_Base($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = $.comment();
				var node_7 = $.first_child(fragment_5);

				$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_8();
							var node_8 = $.first_child(fragment_6);

							$.component(node_8, () => Tabs.Root, ($$anchor, Tabs_Root) => {
								Tabs_Root($$anchor, {
									stretch: true,
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$anchor, $$slotProps) => {
											const root = $.derived(() => $$slotProps.root);
											var fragment_7 = $.comment();
											var node_9 = $.first_child(fragment_7);

											$.each(node_9, 17, () => $.get(uniquePlans), $.index, ($$anchor, plan) => {
												var fragment_8 = $.comment();
												var node_10 = $.first_child(fragment_8);

												{
													let $0 = $.derived(() => $.get(selectedTab) === $.get(plan).$id);

													$.component(node_10, () => Tabs.Item.Button, ($$anchor, Tabs_Item_Button) => {
														Tabs_Item_Button($$anchor, {
															get root() {
																return $.get(root);
															},

															get active() {
																return $.get($0);
															},
															$$events: { click: () => $.set(selectedTab, $.get(plan).$id, true) },
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_15 = $.text();

																$.template_effect(() => $.set_text(text_15, $.get(plan).name));
																$.append($$anchor, text_15);
															},
															$$slots: { default: true }
														});
													});
												}

												$.append($$anchor, fragment_8);
											});

											$.append($$anchor, fragment_7);
										}
									}
								});
							});

							var node_11 = $.sibling(node_8, 2);

							$.component(node_11, () => Typography.Text, ($$anchor, Typography_Text_2) => {
								Typography_Text_2($$anchor, {
									variant: 'm-600',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_16 = $.text();

										$.template_effect(() => $.set_text(text_16, `${$.get(currentPlan).name ?? ''} plan`));
										$.append($$anchor, text_16);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_11, 2);

							appwritePlanView(node_12);
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_4);
	$.pop();
	$$cleanup();
}