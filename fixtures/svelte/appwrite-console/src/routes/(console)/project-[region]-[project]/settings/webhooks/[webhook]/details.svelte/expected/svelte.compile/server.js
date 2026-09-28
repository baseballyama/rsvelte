import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import Button from '$lib/elements/forms/button.svelte';
import { InputSwitch } from '$lib/elements/forms';
import { webhook } from './store';
import { toLocaleDateTime } from '$lib/helpers/date';
import FailedModal from '../failedModal.svelte';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';

export default function Details($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const projectId = page.params.project;
		let enabled;

		onMount(async () => {
			enabled = $.store_get($$store_subs ??= {}, '$webhook', webhook).enabled;
		});

		let showFailed = false;

		async function setEnabled() {
			try {
				await sdk.forProject(page.params.region, projectId).webhooks.update({
					webhookId: $.store_get($$store_subs ??= {}, '$webhook', webhook).$id,
					name: $.store_get($$store_subs ??= {}, '$webhook', webhook).name,
					events: $.store_get($$store_subs ??= {}, '$webhook', webhook).events,
					url: $.store_get($$store_subs ??= {}, '$webhook', webhook).url,
					tls: $.store_get($$store_subs ??= {}, '$webhook', webhook).tls,
					enabled,
					authUsername: $.store_get($$store_subs ??= {}, '$webhook', webhook).authUsername || undefined,
					authPassword: $.store_get($$store_subs ??= {}, '$webhook', webhook).authPassword || undefined
				});

				await invalidate(Dependencies.WEBHOOK);

				addNotification({
					type: 'success',
					message: 'Webhook has been ' + (enabled ? 'enabled' : 'disabled')
				});

				trackEvent(Submit.WebhookUpdateEnabled);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.WebhookUpdateEnabled);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				$$slots: {
					title: ($$renderer) => {
						{
							$$renderer.push(`${$.escape($.store_get($$store_subs ??= {}, '$webhook', webhook).name)}`);
						}
					},

					aside: ($$renderer) => {
						{
							$$renderer.push(`<div class="u-flex u-gap-16"><ul class="u-stretch">`);

							InputSwitch($$renderer, {
								label: enabled ? 'Enabled' : 'Disabled',
								id: 'enable-switch',
								get value() {
									return enabled;
								},

								set value($$value) {
									enabled = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> <li style="margin-top:16px">Created: ${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$webhook', webhook).$createdAt))}</li> <li>Last updated: ${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$webhook', webhook).$updatedAt))}</li></ul></div>`);
						}
					},

					actions: ($$renderer) => {
						{
							$$renderer.push(`<div class="u-flex u-gap-16">`);

							if ($.store_get($$store_subs ??= {}, '$webhook', webhook).logs.length > 0) {
								$$renderer.push('<!--[0-->');

								Button($$renderer, {
									secondary: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->View logs`);
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							Button($$renderer, {
								disabled: enabled === $.store_get($$store_subs ??= {}, '$webhook', webhook).enabled,
								submit: true,
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

			$$renderer.push(`<!----> `);

			FailedModal($$renderer, {
				webhook: $.store_get($$store_subs ??= {}, '$webhook', webhook),
				showUpdateButton: false,
				get show() {
					return showFailed;
				},

				set show($$value) {
					showFailed = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
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