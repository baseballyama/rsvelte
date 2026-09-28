import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { CardGrid } from '$lib/components';
import { toLocaleDateTime } from '$lib/helpers/date';
import { Button, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { trackEvent, trackError } from '$lib/actions/analytics';
import { getTerminologies } from '$database/(entity)';

var root = $.from_html(`<ul><!></ul> <div><p> </p> <p> </p></div>`, 1);

export default function Status($$anchor, $$props) {
	$.push($$props, true);

	let enabled = $.state($.proxy($$props.entity.enabled));
	const { analytics, dependencies } = getTerminologies();

	async function cleanup() {
		// events and notif!
		trackEvent(analytics.submit.entity('UpdateEnabled'));

		addNotification({
			message: `${$$props.entity.name} has been updated`,
			type: 'success'
		});

		// invalidate proper dependency.
		await invalidate(dependencies.entity.singular);
	}

	async function updateStatus() {
		try {
			await $$props.onChangeStatus($.get(enabled));
			await cleanup();
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, analytics.submit.entity('UpdateEnabled'));
		}
	}

	CardGrid($$anchor, {
		$$slots: {
			title: ($$anchor, $$slotProps) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, $$props.entity.name));
				$.append($$anchor, text);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var ul = $.first_child(fragment_2);
				var node = $.child(ul);

				{
					let $0 = $.derived(() => $.get(enabled) ? 'Enabled' : 'Disabled');

					InputSwitch(node, {
						id: 'toggle',
						get label() {
							return $.get($0);
						},

						get value() {
							return $.get(enabled);
						},

						set value($$value) {
							$.set(enabled, $$value, true);
						}
					});
				}

				$.reset(ul);

				var div = $.sibling(ul, 2);
				var p = $.child(div);
				var text_1 = $.only_child(p);
				var p_1 = $.sibling(p, 2);
				var text_2 = $.only_child(p_1);

				$.reset(div);

				$.template_effect(
					($0, $1) => {
						$.set_text(text_1, `Created: ${$0 ?? ''}`);
						$.set_text(text_2, `Last updated: ${$1 ?? ''}`);
					},
					[
						() => toLocaleDateTime($$props.entity.$createdAt),
						() => toLocaleDateTime($$props.entity.$updatedAt)
					]
				);

				$.append($$anchor, fragment_2);
			},

			actions: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => $.get(enabled) === $$props.entity.enabled);

					Button($$anchor, {
						get disabled() {
							return $.get($0);
						},
						$$events: { click: updateStatus },
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

	$.pop();
}