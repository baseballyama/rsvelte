import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Click, trackEvent } from '$lib/actions/analytics';
import { NEW_DEV_PRO_UPGRADE_COUPON } from '$lib/constants';
import { Button } from '$lib/elements/forms';
import { organization } from '$lib/stores/organization';
import { activeHeaderAlert } from '$routes/(console)/store';
import GradientBanner from '../gradientBanner.svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { Layout, Typography } from '@appwrite.io/pink-svelte';

export default function NewDevUpgradePro($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let show = true;

		function handleClose() {
			show = false;

			const now = new Date().getTime();

			localStorage.setItem($.store_get($$store_subs ??= {}, '$activeHeaderAlert', activeHeaderAlert).id, now.toString());
			trackEvent('close_upgrade_banner', { source: 'cloud_credits_banner', campaign: 'WelcomeManual' });
		}

		if (show && $.store_get($$store_subs ??= {}, '$organization', organization)?.$id && !$.store_get($$store_subs ??= {}, '$organization', organization)?.billingPlanDetails?.supportsCredits && !page.url.pathname.includes(base + '/account')) {
			$$renderer.push('<!--[0-->');

			GradientBanner($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'm',
							alignItems: 'center',
							alignContent: 'center',
							direction: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 'column' : 'row',
							children: ($$renderer) => {
								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Get $50 Cloud credits for Appwrite Pro.`);
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
									class: 'u-line-height-1',
									href: `${base}/apply-credit?code=${NEW_DEV_PRO_UPGRADE_COUPON}&org=${$.store_get($$store_subs ??= {}, '$organization', organization).$id}`,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Claim credits`);
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
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}