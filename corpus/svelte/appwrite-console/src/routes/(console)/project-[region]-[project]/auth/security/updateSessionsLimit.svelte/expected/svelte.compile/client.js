import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputNumber } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Typography } from '@appwrite.io/pink-svelte';

export default function UpdateSessionsLimit($$anchor, $$props) {
	$.push($$props, true);

	let maxSessions = $.state($.proxy($$props.policy.total));

	async function updateSessionsLimit() {
		try {
			await sdk.forProject($$props.project.region, $$props.project.$id).project.updateSessionLimitPolicy({ total: $.get(maxSessions) });
			await invalidate(Dependencies.PROJECT);
			addNotification({ type: 'success', message: 'Sessions limit has been updated' });
			trackEvent(Submit.SessionsLimitUpdate);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.SessionsLimitUpdate);
		}
	}

	Form($$anchor, {
		onSubmit: updateSessionsLimit,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.component(node, () => Typography.Text, ($$anchor, Typography_Text) => {
						Typography_Text($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Maximum number of active sessions allowed per user');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Sessions limit');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						InputNumber($$anchor, {
							required: true,
							min: 1,
							max: 100,
							id: 'max-session',
							label: 'Limit',
							get value() {
								return $.get(maxSessions);
							},

							set value($$value) {
								$.set(maxSessions, $$value, true);
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $.get(maxSessions) === $$props.policy.total);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
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
		},
		$$slots: { default: true }
	});

	$.pop();
}