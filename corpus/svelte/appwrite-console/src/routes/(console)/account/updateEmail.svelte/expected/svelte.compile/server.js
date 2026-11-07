import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputPassword, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { user } from '$lib/stores/user';
import { onMount } from 'svelte';
import { Badge, Layout } from '@appwrite.io/pink-svelte';

export default function UpdateEmail($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let email = null;
		let emailPassword = null;

		onMount(async () => {
			email ??= $.store_get($$store_subs ??= {}, '$user', user).email;
		});

		async function updateEmail() {
			try {
				await sdk.forConsole.account.updateEmail({ email, password: emailPassword });

				await Promise.all([
					invalidate(Dependencies.ACCOUNT),
					invalidate(Dependencies.FACTORS)
				]);

				addNotification({ message: 'Email has been updated', type: 'success' });
				trackEvent(Submit.AccountUpdateEmail);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.AccountUpdateEmail);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateEmail,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						$$slots: {
							title: ($$renderer) => {
								{
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											gap: 's',
											alignItems: 'center',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Email `);

												if ($.store_get($$store_subs ??= {}, '$user', user).emailVerification) {
													$$renderer.push('<!--[0-->');

													Badge($$renderer, {
														variant: 'secondary',
														type: 'success',
														size: 's',
														content: 'verified'
													});
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}
							},

							aside: ($$renderer) => {
								{
									InputText($$renderer, {
										id: 'email',
										label: 'Email',
										placeholder: 'Enter email',
										required: true,
										get value() {
											return email;
										},

										set value($$value) {
											email = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (email !== $.store_get($$store_subs ??= {}, '$user', user).email && email) {
										$$renderer.push('<!--[0-->');

										InputPassword($$renderer, {
											id: 'emailPassword',
											label: 'Password',
											placeholder: 'Enter password',
											required: true,
											get value() {
												return emailPassword;
											},

											set value($$value) {
												emailPassword = $$value;
												$$settled = false;
											}
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: email === $.store_get($$store_subs ??= {}, '$user', user).email || !email || !emailPassword,
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