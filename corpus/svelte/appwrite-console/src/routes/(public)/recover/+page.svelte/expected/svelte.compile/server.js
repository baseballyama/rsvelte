import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { Button, Form, InputEmail, InputPassword } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Unauthenticated } from '$lib/layout';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { Divider, Layout, Link } from '@appwrite.io/pink-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let email;
		let userId;
		let secret;
		let password;
		let confirmPassword;

		onMount(() => {
			userId = page.url.searchParams.get('userId');
			secret = page.url.searchParams.get('secret');
		});

		async function recover() {
			let showGenericSuccessNotification = true;

			try {
				await sdk.forConsole.account.createRecovery({ email, url: window.location.toString() });
				trackEvent(Submit.AccountRecover);
			} catch(error) {
				// Do not show error for 403 Forbidden or 404 Not Found to prevent email enumeration
				if (error.code !== 403 && error.code !== 404) {
					showGenericSuccessNotification = false;
					addNotification({ type: 'error', message: error.message });
					trackError(error, Submit.AccountRecover);
				}
			}

			if (showGenericSuccessNotification) {
				addNotification({
					type: 'success',
					message: 'If an account exists for this email, you will receive a password reset link shortly'
				});
			}
		}

		async function setPassword() {
			try {
				if (password !== confirmPassword) {
					throw new Error('Passwords do not match');
				}

				await sdk.forConsole.account.updateRecovery({ userId, secret, password });
				await goto(`${base}/login`);

				addNotification({
					type: 'success',
					message: 'Password has been updated successfully'
				});
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1g8lsjk', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Recover - Appwrite</title>`);
				});
			});

			Unauthenticated($$renderer, {
				children: ($$renderer) => {
					{
						if (userId && secret) {
							$$renderer.push('<!--[0-->');

							Form($$renderer, {
								onSubmit: setPassword,
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											children: ($$renderer) => {
												InputPassword($$renderer, {
													label: 'New password',
													placeholder: 'Enter password',
													id: 'password',
													autofocus: true,
													required: true,
													get value() {
														return password;
													},

													set value($$value) {
														password = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----> `);

												InputPassword($$renderer, {
													label: 'Confirm password',
													placeholder: 'Confirm password',
													id: 'confirm-password',
													required: true,
													get value() {
														return confirmPassword;
													},

													set value($$value) {
														confirmPassword = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													fullWidth: true,
													submit: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Update`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');

							Form($$renderer, {
								onSubmit: recover,
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											children: ($$renderer) => {
												InputEmail($$renderer, {
													id: 'email',
													label: 'Email',
													placeholder: 'Email',
													autofocus: true,
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

												Button($$renderer, {
													fullWidth: true,
													submit: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Recover`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					}
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Password recovery`);
						}
					},

					links: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									children: ($$renderer) => {
										if (Link.Anchor) {
											$$renderer.push('<!--[-->');

											Link.Anchor($$renderer, {
												href: `${base}/login`,
												variant: 'quiet',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Sign in`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <div${$.attr_style('', { height: '20px' })}>`);
										Divider($$renderer, { vertical: true });
										$$renderer.push(`<!----></div> `);

										if (Link.Anchor) {
											$$renderer.push('<!--[-->');

											Link.Anchor($$renderer, {
												href: `${base}/register`,
												variant: 'quiet',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Sign up`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					}
				}
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