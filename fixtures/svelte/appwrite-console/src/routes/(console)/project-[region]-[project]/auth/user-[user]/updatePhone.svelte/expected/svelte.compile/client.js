import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputPhone } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { user } from './store';
import { page } from '$app/state';

export default function UpdatePhone($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let userPhone = null;

	onMount(async () => {
		userPhone ??= $user().phone;
	});

	async function updatePhone() {
		try {
			await sdk.forProject(page.params.region, page.params.project).users.updatePhone({ userId: $user().$id, number: userPhone });
			await invalidate(Dependencies.USER);
			addNotification({ message: 'Phone has been updated', type: 'success' });
			trackEvent(Submit.UserUpdatePhone);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.UserUpdatePhone);
		}
	}

	Form($$anchor, {
		onSubmit: updatePhone,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Phone number must start with \'+\' and maximum of 15 digits.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Phone');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						InputPhone($$anchor, {
							id: 'phone',
							label: 'Phone',
							placeholder: 'For example: +14155552671',
							autocomplete: false,
							get value() {
								return userPhone;
							},

							set value($$value) {
								userPhone = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => userPhone === $user().phone);

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
	$$cleanup();
}