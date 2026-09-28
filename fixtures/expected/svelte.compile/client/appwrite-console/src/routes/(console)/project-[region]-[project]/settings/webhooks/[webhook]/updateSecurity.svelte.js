import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!> <p class="text">Use to secure your endpoint from untrusted sources.</p></div> <!> <!> <!>`, 1);

export default function UpdateSecurity($$anchor, $$props) {
	$.push($$props, true);

	const $webhook = () => $.store_get(webhook, '$webhook', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const projectId = page.params.project;
	let authUsername = null;
	let authPassword = null;
	let tls = false;

	onMount(async () => {
		authUsername ??= $webhook().authUsername;
		authPassword ??= $webhook().authPassword;
		tls = $webhook().tls;
	});

	async function updateSecurity() {
		try {
			await sdk.forProject(page.params.region, projectId).webhooks.update({
				webhookId: $webhook().$id,
				name: $webhook().name,
				events: $webhook().events,
				url: $webhook().url,
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

	Form($$anchor, {
		onSubmit: updateSecurity,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Set an optional basic HTTP authentication username and password to protect your endpoint from\n        unauthorized access.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Security');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var div = $.first_child(fragment_2);
						var node = $.child(div);

						$.component(node, () => Typography.Title, ($$anchor, Typography_Title) => {
							Typography_Title($$anchor, {
								size: 's',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('HTTP Authentication');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						$.next(2);
						$.reset(div);

						var node_1 = $.sibling(div, 2);

						InputText(node_1, {
							label: 'User',
							id: 'user',
							placeholder: 'Enter username',
							get value() {
								return authUsername;
							},

							set value($$value) {
								authUsername = $$value;
							}
						});

						var node_2 = $.sibling(node_1, 2);

						InputPassword(node_2, {
							label: 'Password',
							id: 'password',
							minlength: 0,
							placeholder: 'Enter password',
							get value() {
								return authPassword;
							},

							set value($$value) {
								authPassword = $$value;
							}
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
							Selector_Checkbox($$anchor, {
								id: 'tls',
								label: 'Certificate verification (SSL/TLS)',
								description: 'Placeholder',
								get checked() {
									return tls;
								},

								set checked($$value) {
									tls = $$value;
								}
							});
						});

						$.append($$anchor, fragment_2);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => authUsername === $webhook().authUsername && authPassword === $webhook().authPassword && tls === $webhook().tls);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Update');

									$.append($$anchor, text_3);
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