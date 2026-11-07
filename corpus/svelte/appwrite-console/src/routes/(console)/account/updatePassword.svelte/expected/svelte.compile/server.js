import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Button, Form, InputPassword } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Link } from '@appwrite.io/pink-svelte';

export default function UpdatePassword($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updatePassword,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Forgot your password? `);

							if (Link.Anchor) {
								$$renderer.push('<!--[-->');

								Link.Anchor($$renderer, {
									href: `${base}/recover`,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Recover your password`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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
										id: 'oldPassword',
										label: 'Old password',
										placeholder: 'Enter password',
										required: true,
										get value() {
											return oldPassword;
										},

										set value($$value) {
											oldPassword = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									InputPassword($$renderer, {
										id: 'newPassword',
										label: 'New password',
										placeholder: 'Enter password',
										required: true,
										get value() {
											return newPassword;
										},

										set value($$value) {
											newPassword = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!---->`);
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: !newPassword || !oldPassword,
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
	});
}