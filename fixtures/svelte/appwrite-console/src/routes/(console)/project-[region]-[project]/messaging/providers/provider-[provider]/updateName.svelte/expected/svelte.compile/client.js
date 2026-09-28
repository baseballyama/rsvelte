import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<ul data-private=""><!></ul>`);

export default function UpdateName($$anchor, $$props) {
	$.push($$props, true);

	const $provider = () => $.store_get(provider, '$provider', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let providerName = null;

	onMount(async () => {
		providerName ??= $provider().name;
	});

	async function updateName() {
		try {
			let response = { $id: '', name: '' };
			const providerId = $provider().$id;

			switch ($provider().provider) {
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

			trackEvent(Submit.MessagingProviderUpdate, { provider: $provider() });
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.MessagingProviderUpdate);
		}
	}

	Form($$anchor, {
		onSubmit: updateName,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var text = $.text('Name');

						$.append($$anchor, text);
					},

					aside: ($$anchor, $$slotProps) => {
						var ul = root();
						var node = $.child(ul);

						InputText(node, {
							id: 'name',
							label: 'Name',
							placeholder: 'Enter name',
							autocomplete: false,
							get value() {
								return providerName;
							},

							set value($$value) {
								providerName = $$value;
							}
						});

						$.reset(ul);
						$.append($$anchor, ul);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => providerName === $provider().name);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Update');

									$.append($$anchor, text_1);
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

	$.pop();
	$$cleanup();
}