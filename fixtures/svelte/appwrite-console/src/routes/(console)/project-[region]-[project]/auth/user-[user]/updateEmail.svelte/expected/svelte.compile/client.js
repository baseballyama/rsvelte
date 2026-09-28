import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputEmail } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { user } from './store';
import { page } from '$app/state';

export default function UpdateEmail($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let userEmail = null;

	onMount(async () => {
		userEmail ??= $user().email;
	});

	async function updateEmail() {
		try {
			await sdk.forProject(page.params.region, page.params.project).users.updateEmail({ userId: $user().$id, email: userEmail });
			await invalidate(Dependencies.USER);
			addNotification({ message: 'Email has been updated', type: 'success' });
			trackEvent(Submit.UserUpdateEmail);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.UserUpdateEmail);
		}
	}

	Form($$anchor, {
		onSubmit: updateEmail,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var text = $.text('Email');

						$.append($$anchor, text);
					},

					aside: ($$anchor, $$slotProps) => {
						InputEmail($$anchor, {
							id: 'email',
							label: 'Email',
							placeholder: 'Enter email',
							autocomplete: false,
							get value() {
								return userEmail;
							},

							set value($$value) {
								userEmail = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => userEmail === $user().email);

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
	$$cleanup();
}