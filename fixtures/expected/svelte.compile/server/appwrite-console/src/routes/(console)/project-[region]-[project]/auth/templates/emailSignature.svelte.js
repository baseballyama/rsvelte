import * as $ from 'svelte/internal/server';
import { Click, trackEvent } from '$lib/actions/analytics';
import { CardGrid, EmptyCardImageCloud } from '$lib/components';
import Button from '$lib/elements/forms/button.svelte';
import { app } from '$lib/stores/app';
import { getChangePlanUrl } from '$lib/stores/billing';
import EmailDark from './email-footer-dark.png';
import EmailLight from './email-footer-light.png';
import EmailMobileDark from './email-footer-mobile-dark.png';
import EmailMobileLight from './email-footer-mobile-light.png';

export default function EmailSignature($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { project } = $$props;

		CardGrid($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Enable or disable Appwrite branding in your email template signature.`);
			},

			$$slots: {
				default: true,
				title: ($$renderer) => {
					{
						$$renderer.push(`Email signature`);
					}
				},

				aside: ($$renderer) => {
					{
						EmptyCardImageCloud($$renderer, {
							responsive: true,
							source: 'email_signature_card',
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$renderer, { nextTier }) => {
									$$renderer.push(`<!---->Upgrade to a ${$.escape(nextTier)} plan to remove the Appwrite branding from your emails.`);
								},

								image: ($$renderer) => {
									{
										$$renderer.push(`<div class="is-only-mobile u-width-full-line u-height-100-percent">`);

										if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark') {
											$$renderer.push(`<!--[0--><img${$.attr('src', EmailMobileDark)} class="u-image-object-fit-cover u-only-dark u-width-full-line u-height-100-percent" alt="Email Signature Example"/>`);
										} else {
											$$renderer.push(`<!--[-1--><img${$.attr('src', EmailMobileLight)} class="u-image-object-fit-cover u-only-light u-width-full-line u-height-100-percent" alt="Email Signature Example"/>`);
										}

										$$renderer.push(`<!--]--></div> <div class="is-not-mobile u-width-full-line u-height-100-percent">`);

										if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark') {
											$$renderer.push(`<!--[0--><img width="266"${$.attr('src', EmailDark)} alt="Email Signature Example"${$.attr_style('', { 'object-position': 'top' })}/>`);
										} else {
											$$renderer.push(`<!--[-1--><img width="266"${$.attr('src', EmailLight)} alt="Email Signature Example"${$.attr_style('', { 'object-position': 'top' })}/>`);
										}

										$$renderer.push(`<!--]--></div>`);
									}
								},

								title: ($$renderer) => {
									{
										$$renderer.push(`Upgrade to remove Appwrite branding`);
									}
								},

								cta: ($$renderer, { source }) => {
									{
										Button($$renderer, {
											class: 'u-margin-block-start-32',
											secondary: true,
											fullWidth: true,
											href: getChangePlanUrl(project.teamId),
											children: ($$renderer) => {
												$$renderer.push(`<!---->Upgrade plan`);
											},
											$$slots: { default: true }
										});
									}
								}
							}
						});
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}