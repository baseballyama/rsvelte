import * as $ from 'svelte/internal/server';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Button, Form, InputPassword } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { user } from './store';
import { page } from '$app/state';

export default function UpdatePassword($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let newPassword = null;

		async function updatePassword() {
			try {
				await sdk.forProject(page.params.region, page.params.project).users.updatePassword({
					userId: $.store_get($$store_subs ??= {}, '$user', user).$id,
					password: newPassword
				});

				newPassword = null;
				addNotification({ message: 'Password has been updated', type: 'success' });
				trackEvent(Submit.UserUpdatePassword);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.UserUpdatePassword);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updatePassword,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->A password must contain at least 8 characters.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Password`);
								}
							},

							aside: ($$renderer) => {
								{
									InputPassword($$renderer, {
										id: 'newPassword',
										label: 'New password',
										placeholder: 'Enter new password',
										autocomplete: false,
										get value() {
											return newPassword;
										},

										set value($$value) {
											newPassword = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: !newPassword,
										submit: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Update`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}