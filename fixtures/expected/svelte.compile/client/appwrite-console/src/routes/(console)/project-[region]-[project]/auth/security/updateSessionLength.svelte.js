import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
import { createTimeUnitPair } from '$lib/helpers/unit';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Layout } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function UpdateSessionLength($$anchor, $$props) {
	$.push($$props, true);

	const $baseValue = () => $.store_get($.get(baseValue), '$baseValue', $$stores);
	const $value = () => $.store_get($.get(value), '$value', $$stores);
	const $unit = () => $.store_get($.get(unit), '$unit', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const $$d = $.derived(() => createTimeUnitPair($$props.policy.duration)),
		value = $.derived(() => $.get($$d).value),
		unit = $.derived(() => $.get($$d).unit),
		baseValue = $.derived(() => $.get($$d).baseValue),
		units = $.derived(() => $.get($$d).units);

	const options = $.derived(() => $.get(units).map((v) => ({ label: v.name, value: v.name })));

	async function updateSessionLength() {
		try {
			await sdk.forProject($$props.project.region, $$props.project.$id).project.updateSessionDurationPolicy({ duration: $baseValue() });
			await invalidate(Dependencies.PROJECT);

			addNotification({
				type: 'success',
				message: 'Updated project users limit successfully'
			});

			trackEvent(Submit.SessionsLengthUpdate);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.SessionsLengthUpdate);
		}
	}

	CardGrid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('If you reduce the limit, users who are currently logged in will be logged out of the application.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Session length');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						direction: 'row',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_1 = $.first_child(fragment_2);

							InputNumber(node_1, {
								required: true,
								id: 'length',
								label: 'Length',
								min: 0,
								get value() {
									$.mark_store_binding();

									return $value();
								},

								set value($$value) {
									$.store_set($.get(value), $$value);
								}
							});

							var node_2 = $.sibling(node_1, 2);

							InputSelect(node_2, {
								required: true,
								id: 'period',
								label: 'Time period',
								get options() {
									return $.get(options);
								},

								get value() {
									$.mark_store_binding();

									return $unit();
								},

								set value($$value) {
									$.store_set($.get(unit), $$value);
								}
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},

			actions: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => $baseValue() === $$props.policy.duration);

					Button($$anchor, {
						get disabled() {
							return $.get($0);
						},
						$$events: { click: updateSessionLength },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Update');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});

	$.pop();
	$$cleanup();
}