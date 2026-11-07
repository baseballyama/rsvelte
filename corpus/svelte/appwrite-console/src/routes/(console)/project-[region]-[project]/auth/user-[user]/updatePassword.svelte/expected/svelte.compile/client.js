import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Button, Form, InputPassword } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { user } from './store';
import { page } from '$app/state';

export default function UpdatePassword($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let newPassword = null;

	async function updatePassword() {
		try {
			await sdk.forProject(page.params.region, page.params.project).users.updatePassword({ userId: $user().$id, password: newPassword });
			newPassword = null;
			addNotification({ message: 'Password has been updated', type: 'success' });
			trackEvent(Submit.UserUpdatePassword);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.UserUpdatePassword);
		}
	}

	Form($$anchor, {
		onSubmit: updatePassword,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('A password must contain at least 8 characters.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Password');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						InputPassword($$anchor, {
							id: 'newPassword',
							label: 'New password',
							placeholder: 'Enter new password',
							autocomplete: false,
							get value() {
								return newPassword;
							},

							set value($$value) {
								newPassword = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => !newPassword);

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