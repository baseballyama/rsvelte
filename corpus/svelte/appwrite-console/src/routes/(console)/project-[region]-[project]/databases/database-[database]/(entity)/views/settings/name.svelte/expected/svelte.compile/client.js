import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { subNavigation } from '$lib/stores/database';
import { getTerminologies } from '$database/(entity)';
import { invalidate } from '$app/navigation';

export default function Name($$anchor, $$props) {
	$.push($$props, true);

	let entityName = $.state($.proxy($$props.entity.name));
	const { analytics, dependencies } = getTerminologies();

	async function cleanup() {
		subNavigation.update(); // update the side entity table.

		// events and notif!
		trackEvent(analytics.submit.entity('UpdateName'));

		addNotification({ message: 'Name has been updated', type: 'success' });

		// invalidate proper dependency.
		await invalidate(dependencies.entity.singular);
	}

	async function updateName() {
		try {
			await $$props.onChangeName($.get(entityName));
			await cleanup();
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, analytics.submit.entity('UpdateName'));
		}
	}

	Form($$anchor, {
		onSubmit: updateName,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var text = $.text('Name');

						$.append($$anchor, text);
					},

					aside: ($$anchor, $$slotProps) => {
						InputText($$anchor, {
							required: true,
							id: 'name',
							label: 'Name',
							placeholder: 'Enter name',
							autocomplete: false,
							get value() {
								return $.get(entityName);
							},

							set value($$value) {
								$.set(entityName, $$value, true);
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $.get(entityName) === $$props.entity.name || !$.get(entityName));

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Update');

									$.append($$anchor, text_1);
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