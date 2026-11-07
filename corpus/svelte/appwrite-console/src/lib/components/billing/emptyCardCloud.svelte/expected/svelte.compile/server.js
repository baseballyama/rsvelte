import * as $ from 'svelte/internal/server';
import { Card } from '..';
import { Button } from '$lib/elements/forms';
import { BillingPlanGroup } from '@appwrite.io/console';
import { Click, trackEvent } from '$lib/actions/analytics';
import { Layout, Typography } from '@appwrite.io/pink-svelte';
import { getBasePlanFromGroup, getChangePlanUrl } from '$lib/stores/billing';

export default function EmptyCardCloud($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { service, eventSource, organizationId = null, children = null } = $$props;
		const proPlanName = getBasePlanFromGroup(BillingPlanGroup.Pro).name;

		Card($$renderer, {
			children: ($$renderer) => {
				if (children) {
					$$renderer.push('<!--[0-->');
					children($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');

					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							alignItems: 'center',
							children: ($$renderer) => {
								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										variant: 'm-600',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Upgrade to add ${$.escape(service)}`);
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
											$$renderer.push(`<!---->Upgrade to a ${$.escape(proPlanName)} plan to add ${$.escape(service)} to your organization`);
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
									secondary: true,
									fullWidthMobile: true,
									href: getChangePlanUrl(organizationId),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Upgrade`);
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
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}