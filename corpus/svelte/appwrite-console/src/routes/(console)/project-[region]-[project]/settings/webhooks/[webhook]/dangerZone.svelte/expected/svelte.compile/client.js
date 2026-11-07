import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { webhook } from './store';
import Delete from './delete.svelte';
import { toLocaleDateTime } from '$lib/helpers/date';
import { Card, Typography } from '@appwrite.io/pink-svelte';
import { Click, trackEvent } from '$lib/actions/analytics';

var root = $.from_html(`<!> <!>`, 1);

export default function DangerZone($$anchor, $$props) {
	$.push($$props, true);

	const $webhook = () => $.store_get(webhook, '$webhook', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDelete = false;
	var fragment = root();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('The webhook will be permanently deleted. This action is irreversible.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Delete webhooks');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Base, ($$anchor, Card_Base) => {
					Card_Base($$anchor, {
						variant: 'secondary',
						padding: 's',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
								Typography_Text($$anchor, {
									variant: 'm-600',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, $webhook().name));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text_1) => {
								Typography_Text_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text();

										$.template_effect(($0) => $.set_text(text_3, `Last updated: ${$0 ?? ''}`), [() => toLocaleDateTime($webhook().$updatedAt)]);
										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},

			actions: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					secondary: true,
					$$events: {
						click: () => {
							showDelete = true;
							trackEvent(Click.SettingsWebhookDeleteClick);
						}
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Delete');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_4 = $.sibling(node, 2);

	Delete(node_4, {
		get showDelete() {
			return showDelete;
		},

		set showDelete($$value) {
			showDelete = $$value;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}