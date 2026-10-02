import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function ViewLogsModal($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.prop($$props, 'show', 15, false),
		selectedProxyRule = $.prop($$props, 'selectedProxyRule', 7);

	let error = $.state(null);

	async function retryDomain() {
		$.set(error, null);

		try {
			const apexDomain = getApexDomain(selectedProxyRule().domain);
			const domain = $$props.domainsList?.domains.find((d) => d.domain === apexDomain);

			if (isCloud && domain) {
				await sdk.forConsole.domains.verifyNameservers({ domainId: domain.$id });
			}
		} catch {
			// Ignore error
		}

		try {
			selectedProxyRule(await sdk.forProject(page.params.region, page.params.project).proxy.updateRuleStatus({ ruleId: selectedProxyRule().$id }));
			await invalidate(Dependencies.DOMAINS);
			show(false);
			addNotification({ type: 'success', message: 'Domain verified successfully' });
			trackEvent(Submit.DomainUpdateVerification);
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, Submit.DomainUpdateVerification);
		}
	}

	$.user_effect(() => {
		if (!show()) {
			$.set(error, null);
		}
	});

	{
		let $0 = $.derived(() => selectedProxyRule().status !== ProxyRuleStatus.Unverified);

		Modal($$anchor, {
			title: 'Certificate logs',
			size: 'm',
			onSubmit: retryDomain,
			get hideFooter() {
				return $.get($0);
			},

			get show() {
				return show();
			},

			set show($$value) {
				show($$value);
			},

			get error() {
				return $.get(error);
			},

			set error($$value) {
				$.set(error, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				Logs($$anchor, {
					get logs() {
						return selectedProxyRule().logs;
					},

					get theme() {
						return $app().themeInUse;
					},
					showScrollButton: true,
					height: '250px'
				});
			},

			$$slots: {
				default: true,
				footer: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							Button($$anchor, {
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Retry');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						};

						$.if(node, ($$render) => {
							if (selectedProxyRule().status === ProxyRuleStatus.Unverified) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}