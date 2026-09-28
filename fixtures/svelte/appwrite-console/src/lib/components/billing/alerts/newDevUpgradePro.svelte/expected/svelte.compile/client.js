import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function NewDevUpgradePro($$anchor, $$props) {
	$.push($$props, true);

	const $activeHeaderAlert = () => $.store_get(activeHeaderAlert, '$activeHeaderAlert', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let show = true;

	function handleClose() {
		show = false;

		const now = new Date().getTime();

		localStorage.setItem($activeHeaderAlert().id, now.toString());
		trackEvent('close_upgrade_banner', { source: 'cloud_credits_banner', campaign: 'WelcomeManual' });
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			GradientBanner($$anchor, {
				$$events: { close: handleClose },
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => $isSmallViewport() ? 'column' : 'row');

						$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 'm',
								alignItems: 'center',
								alignContent: 'center',
								get direction() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
										Typography_Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Get $50 Cloud credits for Appwrite Pro.');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									{
										let $0 = $.derived(() => `${base}/apply-credit?code=${NEW_DEV_PRO_UPGRADE_COUPON}&org=${$organization().$id}`);

										Button(node_3, {
											secondary: true,
											fullWidthMobile: true,
											class: 'u-line-height-1',
											get href() {
												return $.get($0);
											},

											$$events: {
												click: () => {
													trackEvent(Click.CreditsRedeemClick, {
														from: 'button',
														source: 'cloud_credits_banner',
														campaign: 'WelcomeManual'
													});
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Claim credits');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		var d = $.derived(() => show && $organization()?.$id && !$organization()?.billingPlanDetails?.supportsCredits && !page.url.pathname.includes(base + '/account'));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}