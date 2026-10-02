import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputPassword, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { webhook } from './store';
import { Selector, Typography } from '@appwrite.io/pink-svelte';

export default function UpdateSecurity($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const projectId = page.params.project;
		let authUsername = null;
		let authPassword = null;
		let tls = false;

		onMount(async () => {
			authUsername ??= $.store_get($$store_subs ??= {}, '$webhook', webhook).authUsername;
			authPassword ??= $.store_get($$store_subs ??= {}, '$webhook', webhook).authPassword;
			tls = $.store_get($$store_subs ??= {}, '$webhook', webhook).tls;
		});

		async function updateSecurity() {
			try {
				await sdk.forProject(page.params.region, projectId).webhooks.update({
					webhookId: $.store_get($$store_subs ??= {}, '$webhook', webhook).$id,
					name: $.store_get($$store_subs ??= {}, '$webhook', webhook).name,
					events: $.store_get($$store_subs ??= {}, '$webhook', webhook).events,
					url: $.store_get($$store_subs ??= {}, '$webhook', webhook).url,
					tls,
					enabled: true,
					authUsername: authUsername || undefined,
					authPassword: authPassword || undefined
				});

				await invalidate(Dependencies.WEBHOOK);

				addNotification({
					type: 'success',
					message: 'Webhook security has been updated'
				});

				trackEvent(Submit.WebhookUpdateSecurity);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.WebhookUpdateSecurity);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateSecurity,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Set an optional basic HTTP authentication username and password to protect your endpoint from
        unauthorized access.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Security`);
								}
							},

							aside: ($$renderer) => {
								{
									$$renderer.push(`<div>`);

									if (Typography.Title) {
										$$renderer.push('<!--[-->');

										Typography.Title($$renderer, {
											size: 's',
											children: ($$renderer) => {
												$$renderer.push(`<!---->HTTP Authentication`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <p class="text">Use to secure your endpoint from untrusted sources.</p></div> `);

									InputText($$renderer, {
										label: 'User',
										id: 'user',
										placeholder: 'Enter username',
										get value() {
											return authUsername;
										},

										set value($$value) {
											authUsername = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									InputPassword($$renderer, {
										label: 'Password',
										id: 'password',
										minlength: 0,
										placeholder: 'Enter password',
										get value() {
											return authPassword;
										},

										set value($$value) {
											authPassword = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (Selector.Checkbox) {
										$$renderer.push('<!--[-->');

										Selector.Checkbox($$renderer, {
											id: 'tls',
											label: 'Certificate verification (SSL/TLS)',
											description: 'Placeholder',
											get checked() {
												return tls;
											},

											set checked($$value) {
												tls = $$value;
												$$settled = false;
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: authUsername === $.store_get($$store_subs ??= {}, '$webhook', webhook).authUsername && authPassword === $.store_get($$store_subs ??= {}, '$webhook', webhook).authPassword && tls === $.store_get($$store_subs ??= {}, '$webhook', webhook).tls,
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