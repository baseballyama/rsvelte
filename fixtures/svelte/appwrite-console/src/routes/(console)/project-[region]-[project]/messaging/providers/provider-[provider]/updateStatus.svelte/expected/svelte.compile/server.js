import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, InputSwitch } from '$lib/elements/forms';
import { toLocaleDateTime } from '$lib/helpers/date';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import Provider, { Providers } from '../../provider.svelte';
import { provider as providerData } from './store';
import { Typography } from '@appwrite.io/pink-svelte';
import { getProviderText } from '../../helper';
import { page } from '$app/state';
import { Layout } from '@appwrite.io/pink-svelte';

export default function UpdateStatus($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let enabled = null;

		onMount(() => {
			enabled ??= $.store_get($$store_subs ??= {}, '$providerData', providerData).enabled;
		});

		async function updateStatus() {
			try {
				let response = { $id: '', name: '' };
				const providerId = $.store_get($$store_subs ??= {}, '$providerData', providerData).$id;

				switch ($.store_get($$store_subs ??= {}, '$providerData', providerData).provider) {
					case Providers.Twilio:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateTwilioProvider({ providerId, enabled });
						break;

					case Providers.Msg91:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateMsg91Provider({ providerId, enabled });
						break;

					case Providers.Telesign:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateTelesignProvider({ providerId, enabled });
						break;

					case Providers.Textmagic:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateTextmagicProvider({ providerId, enabled });
						break;

					case Providers.Vonage:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateVonageProvider({ providerId, enabled });
						break;

					case Providers.Mailgun:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateMailgunProvider({ providerId, enabled });
						break;

					case Providers.Sendgrid:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateSendgridProvider({ providerId, enabled });
						break;

					case Providers.SMTP:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateSMTPProvider({ providerId, enabled });
						break;

					case Providers.FCM:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateFCMProvider({ providerId, enabled });
						break;

					case Providers.APNS:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateAPNSProvider({ providerId, enabled });
						break;
				}

				await invalidate(Dependencies.MESSAGING_PROVIDER);

				addNotification({
					type: 'success',
					message: `${response.name} has been ${enabled ? 'enabled' : 'disabled'}`
				});

				trackEvent(Submit.MessagingProviderUpdate, {
					provider: $.store_get($$store_subs ??= {}, '$providerData', providerData)
				});
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.MessagingProviderUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16" data-private="">`);

					Provider($$renderer, {
						provider: $.store_get($$store_subs ??= {}, '$providerData', providerData).provider,
						size: 'l',
						children: ($$renderer) => {
							if (Typography.Title) {
								$$renderer.push('<!--[-->');

								Typography.Title($$renderer, {
									size: 's',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$providerData', providerData).name)}`);
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

					$$renderer.push(`<!----></div>`);
				},

				$$slots: {
					default: true,
					aside: ($$renderer) => {
						{
							$$renderer.push(`<div class="u-flex u-main-space-between"><div data-private="" class="u-flex-vertical u-gap-16"><ul>`);

							InputSwitch($$renderer, {
								id: 'enabled',
								label: enabled ? 'Enabled' : 'Disabled',
								get value() {
									return enabled;
								},

								set value($$value) {
									enabled = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----></ul> <div>`);

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									gap: 'xs',
									children: ($$renderer) => {
										$$renderer.push(`<span>Provider:</span>`);

										Provider($$renderer, {
											noIcon: true,
											provider: $.store_get($$store_subs ??= {}, '$providerData', providerData).provider
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

							$$renderer.push(` <p class="title">Type: ${$.escape(getProviderText($.store_get($$store_subs ??= {}, '$providerData', providerData).type))}</p> <p>Created: ${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$providerData', providerData).$createdAt))}</p></div></div></div>`);
						}
					},

					actions: ($$renderer) => {
						{
							$$renderer.push(`<div class="u-flex u-flex-wrap u-gap-12">`);

							Button($$renderer, {
								disabled: $.store_get($$store_subs ??= {}, '$providerData', providerData).enabled === enabled,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Update`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
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
	});
}