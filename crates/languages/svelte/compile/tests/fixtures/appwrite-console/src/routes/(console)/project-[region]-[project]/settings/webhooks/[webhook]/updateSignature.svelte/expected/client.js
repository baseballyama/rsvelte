import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Alert, Link } from '@appwrite.io/pink-svelte';
import Regenerate from './regenerate.svelte';
import { Click, trackEvent } from '$lib/actions/analytics';

var root = $.from_html(`Used to validate incoming webhook payloads with the \`X-Appwrite-Webhook-Signature\` header. <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function UpdateSignature($$anchor, $$props) {
	$.push($$props, true);

	let showRegenerate = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			$.component(node_1, () => Link.Anchor, ($$anchor, Link_Anchor) => {
				Link_Anchor($$anchor, {
					href: 'https://appwrite.io/docs/advanced/platform/webhooks#verification',
					target: '_blank',
					rel: 'noopener noreferrer',
					class: 'link',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Learn more');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Webhook secret');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => Alert.Inline, ($$anchor, Alert_Inline) => {
					Alert_Inline($$anchor, {
						status: 'info',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('This secret is only shown once after webhook creation or secret rotation.');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},

			actions: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					secondary: true,
					submit: true,
					$$events: {
						click: () => {
							showRegenerate = true;
							trackEvent(Click.SettingsWebhookUpdateSignatureClick);
						}
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Rotate secret');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_3 = $.sibling(node, 2);

	Regenerate(node_3, {
		get show() {
			return showRegenerate;
		},

		set show($$value) {
			showRegenerate = $$value;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}