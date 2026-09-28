import * as $ from 'svelte/internal/server';
import { Modal } from '$lib/components';
import { Logs } from '@appwrite.io/pink-svelte';
import { app } from '$lib/stores/app';
import { ProxyRuleStatus } from '@appwrite.io/console';
import { Button } from '$lib/elements/forms';
import { getApexDomain } from '$lib/helpers/tlds';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';
import { addNotification } from '$lib/stores/notifications';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

export default function ViewLogsModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = false, selectedProxyRule, domainsList } = $$props;
		let error = null;

		async function retryDomain() {
			error = null;

			try {
				const apexDomain = getApexDomain(selectedProxyRule.domain);
				const domain = domainsList?.domains.find((d) => d.domain === apexDomain);

				if (isCloud && domain) {
					await sdk.forConsole.domains.verifyNameservers({ domainId: domain.$id });
				}
			} catch {
				// Ignore error
			}

			try {
				selectedProxyRule = await sdk.forProject(page.params.region, page.params.project).proxy.updateRuleStatus({ ruleId: selectedProxyRule.$id });
				await invalidate(Dependencies.DOMAINS);
				show = false;
				addNotification({ type: 'success', message: 'Domain verified successfully' });
				trackEvent(Submit.DomainUpdateVerification);
			} catch(e) {
				error = e.message;
				trackError(e, Submit.DomainUpdateVerification);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Certificate logs',
				size: 'm',
				onSubmit: retryDomain,
				hideFooter: selectedProxyRule.status !== ProxyRuleStatus.Unverified,
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Logs($$renderer, {
						logs: selectedProxyRule.logs,
						theme: $.store_get($$store_subs ??= {}, '$app', app).themeInUse,
						showScrollButton: true,
						height: '250px'
					});
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							if (selectedProxyRule.status === ProxyRuleStatus.Unverified) {
								$$renderer.push('<!--[0-->');

								Button($$renderer, {
									submit: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Retry`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show });
	});
}