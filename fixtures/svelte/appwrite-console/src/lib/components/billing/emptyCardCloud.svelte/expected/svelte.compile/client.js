import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from '..';
import { Button } from '$lib/elements/forms';
import { BillingPlanGroup } from '@appwrite.io/console';
import { Click, trackEvent } from '$lib/actions/analytics';
import { Layout, Typography } from '@appwrite.io/pink-svelte';
import { getBasePlanFromGroup, getChangePlanUrl } from '$lib/stores/billing';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function EmptyCardCloud($$anchor, $$props) {
	$.push($$props, true);

	let organizationId = $.prop($$props, 'organizationId', 3, null),
		children = $.prop($$props, 'children', 3, null);

	const proPlanName = getBasePlanFromGroup(BillingPlanGroup.Pro).name;

	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, children);
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							alignItems: 'center',
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
									Typography_Text($$anchor, {
										variant: 'm-600',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, `Upgrade to add ${$$props.service ?? ''}`));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								var node_4 = $.sibling(node_3, 2);

								$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text_1) => {
									Typography_Text_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, `Upgrade to a ${proPlanName ?? ''} plan to add ${$$props.service ?? ''} to your organization`));
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_4, 2);

								{
									let $0 = $.derived(() => getChangePlanUrl(organizationId()));

									Button(node_5, {
										secondary: true,
										fullWidthMobile: true,
										get href() {
											return $.get($0);
										},

										$$events: {
											click: () => {
												trackEvent(Click.OrganizationClickUpgrade, { from: 'button', source: $$props.eventSource });
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Upgrade');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								}

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node, ($$render) => {
					if (children()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}