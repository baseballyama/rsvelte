import * as $ from 'svelte/internal/server';
import { CardGrid } from '$lib/components';
import { Button, Form, InputText } from '$lib/elements/forms';
import { onMount } from 'svelte';
import { provider } from './store';
import { Providers } from '../../provider.svelte';
import { sdk } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { page } from '$app/state';

export default function UpdateName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let providerName = null;

		onMount(async () => {
			providerName ??= $.store_get($$store_subs ??= {}, '$provider', provider).name;
		});

		async function updateName() {
			try {
				let response = { $id: '', name: '' };
				const providerId = $.store_get($$store_subs ??= {}, '$provider', provider).$id;

				switch ($.store_get($$store_subs ??= {}, '$provider', provider).provider) {
					case Providers.Twilio:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateTwilioProvider({ providerId, name: providerName });
						break;

					case Providers.Msg91:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateMsg91Provider({ providerId, name: providerName });
						break;

					case Providers.Telesign:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateTelesignProvider({ providerId, name: providerName });
						break;

					case Providers.Textmagic:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateTextmagicProvider({ providerId, name: providerName });
						break;

					case Providers.Vonage:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateVonageProvider({ providerId, name: providerName });
						break;

					case Providers.Mailgun:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateMailgunProvider({ providerId, name: providerName });
						break;

					case Providers.Sendgrid:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateSendgridProvider({ providerId, name: providerName });
						break;

					case Providers.SMTP:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateSMTPProvider({ providerId, name: providerName });
						break;

					case Providers.FCM:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateFCMProvider({ providerId, name: providerName });
						break;

					case Providers.APNS:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.updateAPNSProvider({ providerId, name: providerName });
						break;
				}

				await invalidate(Dependencies.MESSAGING_PROVIDER);

				addNotification({
					type: 'success',
					message: `${response.name} has been updated`
				});

				trackEvent(Submit.MessagingProviderUpdate, {
					provider: $.store_get($$store_subs ??= {}, '$provider', provider)
				});
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.MessagingProviderUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateName,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						$$slots: {
							title: ($$renderer) => {
								{
									$$renderer.push(`Name`);
								}
							},

							aside: ($$renderer) => {
								{
									$$renderer.push(`<ul data-private="">`);

									InputText($$renderer, {
										id: 'name',
										label: 'Name',
										placeholder: 'Enter name',
										autocomplete: false,
										get value() {
											return providerName;
										},

										set value($$value) {
											providerName = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></ul>`);
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: providerName === $.store_get($$store_subs ??= {}, '$provider', provider).name,
										submit: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Update`);
										},
										$$slots: { default: true }
									});
								}
							}
						}
					});
				},
				$$slots: { default: true }
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