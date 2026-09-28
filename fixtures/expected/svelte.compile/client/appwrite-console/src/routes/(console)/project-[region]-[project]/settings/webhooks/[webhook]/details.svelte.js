import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="u-flex u-gap-16"><ul class="u-stretch"><!> <li style="margin-top:16px"> </li> <li> </li></ul></div>`);
var root_1 = $.from_html(`<div class="u-flex u-gap-16"><!> <!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Details($$anchor, $$props) {
	$.push($$props, true);

	const $webhook = () => $.store_get(webhook, '$webhook', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const projectId = page.params.project;
	let enabled;

	onMount(async () => {
		enabled = $webhook().enabled;
	});

	let showFailed = false;

	async function setEnabled() {
		try {
			await sdk.forProject(page.params.region, projectId).webhooks.update({
				webhookId: $webhook().$id,
				name: $webhook().name,
				events: $webhook().events,
				url: $webhook().url,
				tls: $webhook().tls,
				enabled,
				authUsername: $webhook().authUsername || undefined,
				authPassword: $webhook().authPassword || undefined
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

	var fragment = root_2();
	var node = $.first_child(fragment);

	CardGrid(node, {
		$$slots: {
			title: ($$anchor, $$slotProps) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, $webhook().name));
				$.append($$anchor, text);
			},

			aside: ($$anchor, $$slotProps) => {
				var div = root();
				var ul = $.child(div);
				var node_1 = $.child(ul);

				{
					let $0 = $.derived(() => enabled ? 'Enabled' : 'Disabled');

					InputSwitch(node_1, {
						get label() {
							return $.get($0);
						},
						id: 'enable-switch',
						get value() {
							return enabled;
						},

						set value($$value) {
							enabled = $$value;
						}
					});
				}

				var li = $.sibling(node_1, 2);
				var text_1 = $.only_child(li);
				var li_1 = $.sibling(li, 2);
				var text_2 = $.only_child(li_1);

				$.reset(ul);
				$.reset(div);

				$.template_effect(
					($0, $1) => {
						$.set_text(text_1, `Created: ${$0 ?? ''}`);
						$.set_text(text_2, `Last updated: ${$1 ?? ''}`);
					},
					[
						() => toLocaleDateTime($webhook().$createdAt),
						() => toLocaleDateTime($webhook().$updatedAt)
					]
				);

				$.append($$anchor, div);
			},

			actions: ($$anchor, $$slotProps) => {
				var div_1 = root_1();
				var node_2 = $.child(div_1);

				{
					var consequent = ($$anchor) => {
						Button($$anchor, {
							secondary: true,
							$$events: { click: () => showFailed = true },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('View logs');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_2, ($$render) => {
						if ($webhook().logs.length > 0) $$render(consequent);
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					let $0 = $.derived(() => enabled === $webhook().enabled);

					Button(node_3, {
						get disabled() {
							return $.get($0);
						},
						submit: true,
						$$events: { click: setEnabled },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Update');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				}

				$.reset(div_1);
				$.append($$anchor, div_1);
			}
		}
	});

	var node_4 = $.sibling(node, 2);

	FailedModal(node_4, {
		get webhook() {
			return $webhook();
		},
		showUpdateButton: false,
		get show() {
			return showFailed;
		},

		set show($$value) {
			showFailed = $$value;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}