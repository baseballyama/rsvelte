import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Button, Form, InputPassword } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Link } from '@appwrite.io/pink-svelte';

var root = $.from_html(`Forgot your password? <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function UpdatePassword($$anchor, $$props) {
	$.push($$props, true);

	let newPassword = null;
	let oldPassword = null;

	async function updatePassword() {
		try {
			await sdk.forConsole.account.updatePassword({ password: newPassword, oldPassword });
			newPassword = oldPassword = null;
			addNotification({ message: 'Password has been updated', type: 'success' });
			trackEvent(Submit.AccountUpdatePassword);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.AccountUpdatePassword);
		}
	}

	Form($$anchor, {
		onSubmit: updatePassword,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node = $.sibling($.first_child(fragment_2));

					{
						let $0 = $.derived(() => `${base}/recover`);

						$.component(node, () => Link.Anchor, ($$anchor, Link_Anchor) => {
							Link_Anchor($$anchor, {
								get href() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Recover your password');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_2);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Password');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_1 = $.first_child(fragment_3);

						InputPassword(node_1, {
							id: 'oldPassword',
							label: 'Old password',
							placeholder: 'Enter password',
							required: true,
							get value() {
								return oldPassword;
							},

							set value($$value) {
								oldPassword = $$value;
							}
						});

						var node_2 = $.sibling(node_1, 2);

						InputPassword(node_2, {
							id: 'newPassword',
							label: 'New password',
							placeholder: 'Enter password',
							required: true,
							get value() {
								return newPassword;
							},

							set value($$value) {
								newPassword = $$value;
							}
						});

						$.append($$anchor, fragment_3);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => !newPassword || !oldPassword);

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