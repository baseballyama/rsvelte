import * as $ from 'svelte/internal/server';
import { Card, Typography, Icon } from '@appwrite.io/pink-svelte';
import { IconCheck, IconX, IconLockClosed } from '@appwrite.io/pink-icons-svelte';
import { Button } from '$lib/elements/forms';
import { resolveOAuth2AppLogoUrl } from '$lib/helpers/oauth2-app-logo';

export default function Outcome_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * Present when the client redirect is a native deep link (cursor://…).
		 * The browser already attempted it once; the button retries it for users
		 * who dismissed the OS "open application" prompt.
		 */
		let {
			outcome,
			flow,
			app = null,
			accountLabel = undefined,
			redirectUrl = undefined
		} = $$props;

		const approved = $.derived(() => outcome === 'approved');
		const appName = $.derived(() => app?.name ?? 'the application');
		const appLogoUrl = $.derived(() => resolveOAuth2AppLogoUrl(app));
		const appInitial = $.derived(() => (app?.name || '?').charAt(0).toUpperCase());
		const accountInitial = $.derived(() => (accountLabel || '?').charAt(0).toUpperCase());

		const title = $.derived(() => approved()
			? flow === 'device' ? 'Device connected' : 'Access granted'
			: 'Request cancelled');

		const message = $.derived(() => {
			if (!approved()) {
				return `No access was granted to ${appName()}. You can close this tab.`;
			}

			if (flow === 'device') {
				return `You've authorized ${appName()}. Return to your device — it will continue automatically.`;
			}

			if (redirectUrl) {
				return `Return to ${appName()} to continue. If it didn't open automatically, use the button below.`;
			}

			return `Return to ${appName()} to continue. You can close this tab.`;
		});

		if (Card.Base) {
			$$renderer.push('<!--[-->');

			Card.Base($$renderer, {
				padding: 'none',
				radius: 'l',
				style: 'width: 100%; overflow: hidden;',
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_class('outcome svelte-5dangw', void 0, { 'approved': approved() })}><header class="header svelte-5dangw"><div class="identity svelte-5dangw">`);

					if (appLogoUrl()) {
						$$renderer.push(`<!--[0--><img${$.attr('src', appLogoUrl())}${$.attr('alt', appName())} class="avatar svelte-5dangw"/>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="avatar placeholder svelte-5dangw">${$.escape(appInitial())}</div>`);
					}

					$$renderer.push(`<!--]--> `);

					if (accountLabel) {
						$$renderer.push(`<!--[0--><span class="connector svelte-5dangw"><span class="connector-line svelte-5dangw"></span> <span class="connector-node svelte-5dangw">`);
						Icon($$renderer, { icon: approved() ? IconCheck : IconX, size: 's' });
						$$renderer.push(`<!----></span> <span class="connector-line svelte-5dangw"></span></span> <div class="avatar account svelte-5dangw">${$.escape(accountInitial())}</div>`);
					} else {
						$$renderer.push(`<!--[-1--><span${$.attr_class('status-badge svelte-5dangw', void 0, { 'approved': approved() })}>`);
						Icon($$renderer, { icon: approved() ? IconCheck : IconX, size: 's' });
						$$renderer.push(`<!----></span>`);
					}

					$$renderer.push(`<!--]--></div> <div class="headline svelte-5dangw">`);

					if (Typography.Title) {
						$$renderer.push('<!--[-->');

						Typography.Title($$renderer, {
							size: 'm',
							align: 'center',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(title())}`);
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
							variant: 'm-400',
							align: 'center',
							color: '--fgcolor-neutral-secondary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(message())}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div></header> <div class="body svelte-5dangw">`);

					if (approved() && redirectUrl) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							fullWidth: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open ${$.escape(app?.name ?? 'application')}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <p class="close-hint svelte-5dangw">It's safe to close this tab.</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <p class="footnote svelte-5dangw">`);
					Icon($$renderer, { icon: IconLockClosed, size: 's' });
					$$renderer.push(`<!----> `);

					if (approved()) {
						$$renderer.push(`<!--[0--><span>You can revoke access anytime in your account settings</span>`);
					} else {
						$$renderer.push(`<!--[-1--><span>${$.escape(appName())} was not given access to your account</span>`);
					}

					$$renderer.push(`<!--]--></p></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}