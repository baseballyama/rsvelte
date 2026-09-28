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

export default function UpdateName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const projectId = page.params.project;
		let name = null;

		onMount(async () => {
			name ??= $.store_get($$store_subs ??= {}, '$webhook', webhook).name;
		});

		async function updateName() {
			try {
				await sdk.forProject(page.params.region, projectId).webhooks.update({
					webhookId: $.store_get($$store_subs ??= {}, '$webhook', webhook).$id,
					name,
					events: $.store_get($$store_subs ??= {}, '$webhook', webhook).events,
					url: $.store_get($$store_subs ??= {}, '$webhook', webhook).url,
					tls: $.store_get($$store_subs ??= {}, '$webhook', webhook).tls,
					enabled: true,
					authUsername: $.store_get($$store_subs ??= {}, '$webhook', webhook).authUsername || undefined,
					authPassword: $.store_get($$store_subs ??= {}, '$webhook', webhook).authPassword || undefined
				});

				await invalidate(Dependencies.WEBHOOK);
				addNotification({ type: 'success', message: 'Webhook name has been updated' });
				trackEvent(Submit.WebhookUpdateName);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.WebhookUpdateName);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateName,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Choose any name that will help you distinguish between Webhooks.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Name`);
								}
							},

							aside: ($$renderer) => {
								{
									InputText($$renderer, {
										id: 'name',
										label: 'Name',
										required: true,
										placeholder: 'Enter name',
										get value() {
											return name;
										},

										set value($$value) {
											name = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: name === $.store_get($$store_subs ??= {}, '$webhook', webhook).name || !name,
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