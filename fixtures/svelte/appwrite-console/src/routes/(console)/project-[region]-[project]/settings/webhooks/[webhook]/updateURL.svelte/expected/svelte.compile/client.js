import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { webhook } from './store';

export default function UpdateURL($$anchor, $$props) {
	$.push($$props, true);

	const $webhook = () => $.store_get(webhook, '$webhook', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const projectId = page.params.project;
	let url = null;

	onMount(async () => {
		url ??= $webhook().url;
	});

	async function updateUrl() {
		try {
			await sdk.forProject(page.params.region, projectId).webhooks.update({
				webhookId: $webhook().$id,
				name: $webhook().name,
				events: $webhook().events,
				url,
				tls: $webhook().tls,
				enabled: true,
				authUsername: $webhook().authUsername || undefined,
				authPassword: $webhook().authPassword || undefined
			});

			await invalidate(Dependencies.WEBHOOK);
			addNotification({ type: 'success', message: 'Webhook url has been updated' });
			trackEvent(Submit.WebhookUpdateUrl);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.WebhookUpdateUrl);
		}
	}

	Form($$anchor, {
		onSubmit: updateUrl,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var text = $.text('URL');

						$.append($$anchor, text);
					},

					aside: ($$anchor, $$slotProps) => {
						InputText($$anchor, {
							id: 'url',
							label: 'POST URL',
							required: true,
							placeholder: 'https://example.com/callback',
							get value() {
								return url;
							},

							set value($$value) {
								url = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => url === $webhook().url || !url);

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