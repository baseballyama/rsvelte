import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16" data-private=""><!></div>`);
var root_1 = $.from_html(`<span>Provider:</span><!>`, 1);
var root_2 = $.from_html(`<div class="u-flex u-main-space-between"><div data-private="" class="u-flex-vertical u-gap-16"><ul><!></ul> <div><!> <p class="title"> </p> <p> </p></div></div></div>`);
var root_3 = $.from_html(`<div class="u-flex u-flex-wrap u-gap-12"><!></div>`);

export default function UpdateStatus($$anchor, $$props) {
	$.push($$props, true);

	const $providerData = () => $.store_get(providerData, '$providerData', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let enabled = null;

	onMount(() => {
		enabled ??= $providerData().enabled;
	});

	async function updateStatus() {
		try {
			let response = { $id: '', name: '' };
			const providerId = $providerData().$id;

			switch ($providerData().provider) {
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

			trackEvent(Submit.MessagingProviderUpdate, { provider: $providerData() });
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.MessagingProviderUpdate);
		}
	}

	CardGrid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Provider(node, {
				get provider() {
					return $providerData().provider;
				},
				size: 'l',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => Typography.Title, ($$anchor, Typography_Title) => {
						Typography_Title($$anchor, {
							size: 's',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, $providerData().name));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},

		$$slots: {
			default: true,
			aside: ($$anchor, $$slotProps) => {
				var div_1 = root_2();
				var div_2 = $.child(div_1);
				var ul = $.child(div_2);
				var node_2 = $.child(ul);

				{
					let $0 = $.derived(() => enabled ? 'Enabled' : 'Disabled');

					InputSwitch(node_2, {
						id: 'enabled',
						get label() {
							return $.get($0);
						},

						get value() {
							return enabled;
						},

						set value($$value) {
							enabled = $$value;
						}
					});
				}

				$.reset(ul);

				var div_3 = $.sibling(ul, 2);
				var node_3 = $.child(div_3);

				$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						direction: 'row',
						gap: 'xs',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_4 = $.sibling($.first_child(fragment_3));

							Provider(node_4, {
								noIcon: true,
								get provider() {
									return $providerData().provider;
								}
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var p = $.sibling(node_3, 2);
				var text_1 = $.only_child(p);
				var p_1 = $.sibling(p, 2);
				var text_2 = $.only_child(p_1);

				$.reset(div_3);
				$.reset(div_2);
				$.reset(div_1);

				$.template_effect(
					($0, $1) => {
						$.set_text(text_1, `Type: ${$0 ?? ''}`);
						$.set_text(text_2, `Created: ${$1 ?? ''}`);
					},
					[
						() => getProviderText($providerData().type),
						() => toLocaleDateTime($providerData().$createdAt)
					]
				);

				$.append($$anchor, div_1);
			},

			actions: ($$anchor, $$slotProps) => {
				var div_4 = root_3();
				var node_5 = $.child(div_4);

				{
					let $0 = $.derived(() => $providerData().enabled === enabled);

					Button(node_5, {
						get disabled() {
							return $.get($0);
						},
						$$events: { click: () => updateStatus() },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Update');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div_4);
				$.append($$anchor, div_4);
			}
		}
	});

	$.pop();
	$$cleanup();
}