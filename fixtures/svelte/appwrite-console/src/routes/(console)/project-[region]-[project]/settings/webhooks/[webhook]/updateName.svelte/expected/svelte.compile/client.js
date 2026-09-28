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

export default function UpdateName($$anchor, $$props) {
	$.push($$props, true);

	const $webhook = () => $.store_get(webhook, '$webhook', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const projectId = page.params.project;
	let name = null;

	onMount(async () => {
		name ??= $webhook().name;
	});

	async function updateName() {
		try {
			await sdk.forProject(page.params.region, projectId).webhooks.update({
				webhookId: $webhook().$id,
				name,
				events: $webhook().events,
				url: $webhook().url,
				tls: $webhook().tls,
				enabled: true,
				authUsername: $webhook().authUsername || undefined,
				authPassword: $webhook().authPassword || undefined
			});

			await invalidate(Dependencies.WEBHOOK);
			addNotification({ type: 'success', message: 'Webhook name has been updated' });
			trackEvent(Submit.WebhookUpdateName);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.WebhookUpdateName);
		}
	}

	Form($$anchor, {
		onSubmit: updateName,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Choose any name that will help you distinguish between Webhooks.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Name');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						InputText($$anchor, {
							id: 'name',
							label: 'Name',
							required: true,
							placeholder: 'Enter name',
							get value() {
								return name;
							},

							set value($$value) {
								name = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => name === $webhook().name || !name);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Update');

									$.append($$anchor, text_2);
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