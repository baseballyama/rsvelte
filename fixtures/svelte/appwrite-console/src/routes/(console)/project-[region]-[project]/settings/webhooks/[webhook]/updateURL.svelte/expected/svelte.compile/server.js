import * as $ from 'svelte/internal/server';
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

export default function UpdateURL($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const projectId = page.params.project;
		let url = null;

		onMount(async () => {
			url ??= $.store_get($$store_subs ??= {}, '$webhook', webhook).url;
		});

		async function updateUrl() {
			try {
				await sdk.forProject(page.params.region, projectId).webhooks.update({
					webhookId: $.store_get($$store_subs ??= {}, '$webhook', webhook).$id,
					name: $.store_get($$store_subs ??= {}, '$webhook', webhook).name,
					events: $.store_get($$store_subs ??= {}, '$webhook', webhook).events,
					url,
					tls: $.store_get($$store_subs ??= {}, '$webhook', webhook).tls,
					enabled: true,
					authUsername: $.store_get($$store_subs ??= {}, '$webhook', webhook).authUsername || undefined,
					authPassword: $.store_get($$store_subs ??= {}, '$webhook', webhook).authPassword || undefined
				});

				await invalidate(Dependencies.WEBHOOK);
				addNotification({ type: 'success', message: 'Webhook url has been updated' });
				trackEvent(Submit.WebhookUpdateUrl);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.WebhookUpdateUrl);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateUrl,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						$$slots: {
							title: ($$renderer) => {
								{
									$$renderer.push(`URL`);
								}
							},

							aside: ($$renderer) => {
								{
									InputText($$renderer, {
										id: 'url',
										label: 'POST URL',
										required: true,
										placeholder: 'https://example.com/callback',
										get value() {
											return url;
										},

										set value($$value) {
											url = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: url === $.store_get($$store_subs ??= {}, '$webhook', webhook).url || !url,
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