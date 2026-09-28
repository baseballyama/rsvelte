import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Click, trackEvent } from '$lib/actions/analytics';
import { Button } from '$lib/elements/forms';
import { HeaderAlert } from '$lib/layout';
import { hideBillingHeaderRoutes, readOnly, getChangePlanUrl } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';

var root = $.from_html(`Usage for the <b> </b> `, 1);
var root_1 = $.from_html(`<span class="text">View usage</span>`);
var root_2 = $.from_html(`<span class="text">Upgrade plan</span>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function LimitReached($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $readOnly = () => $.store_get(readOnly, '$readOnly', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => `${$organization().name} usage has reached the ${$organization().billingPlanDetails.name} plan limit`);

				HeaderAlert($$anchor, {
					type: 'error',
					get title() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var b = $.sibling($.first_child(fragment_2));
						var text = $.only_child(b, true);
						var text_1 = $.sibling(b);

						$.template_effect(() => {
							$.set_text(text, $organization().name);

							$.set_text(text_1, ` organization has reached the limits of the ${$organization().billingPlanDetails.name ?? ''}
            plan. Consider upgrading to increase your resource usage.`);
						});

						$.append($$anchor, fragment_2);
					},

					$$slots: {
						default: true,
						buttons: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var node_1 = $.first_child(fragment_3);

							{
								var consequent = ($$anchor) => {
									{
										let $0 = $.derived(() => `${base}/organization-${$organization().$id}/usage`);

										Button($$anchor, {
											get href() {
												return $.get($0);
											},
											text: true,
											fullWidthMobile: true,
											children: ($$anchor, $$slotProps) => {
												var span = root_1();

												$.append($$anchor, span);
											},
											$$slots: { default: true }
										});
									}
								};

								$.if(node_1, ($$render) => {
									if (!page.data.currentPlan?.usagePerProject) $$render(consequent);
								});
							}

							var node_2 = $.sibling(node_1, 2);

							{
								let $0 = $.derived(() => getChangePlanUrl($organization().$id));

								Button(node_2, {
									get href() {
										return $.get($0);
									},
									secondary: true,
									fullWidthMobile: true,
									$$events: {
										click: () => {
											trackEvent(Click.OrganizationClickUpgrade, { from: 'button', source: 'limit_reached_banner' });
										}
									},

									children: ($$anchor, $$slotProps) => {
										var span_1 = root_2();

										$.append($$anchor, span_1);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_3);
						}
					}
				});
			}
		};

		var d = $.derived(() => $organization()?.$id && !$organization()?.billingPlanDetails.usage && $readOnly() && !hideBillingHeaderRoutes.includes(page.url.pathname));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}