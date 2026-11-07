import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div><!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	$.head('1g8lsjk', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Recover - Appwrite';
		});
	});

	Unauthenticated($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Form($$anchor, {
						onSubmit: setPassword,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_2 = $.first_child(fragment_4);

										InputPassword(node_2, {
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
											}
										});

										var node_3 = $.sibling(node_2, 2);

										InputPassword(node_3, {
											label: 'Confirm password',
											placeholder: 'Confirm password',
											id: 'confirm-password',
											required: true,
											get value() {
												return confirmPassword;
											},

											set value($$value) {
												confirmPassword = $$value;
											}
										});

										var node_4 = $.sibling(node_3, 2);

										Button(node_4, {
											fullWidth: true,
											submit: true,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Update');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					Form($$anchor, {
						onSubmit: recover,
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
								Layout_Stack_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_1();
										var node_6 = $.first_child(fragment_7);

										InputEmail(node_6, {
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
											}
										});

										var node_7 = $.sibling(node_6, 2);

										Button(node_7, {
											fullWidth: true,
											submit: true,
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Recover');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				};

				$.if(node, ($$render) => {
					if (userId && secret) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_2 = $.text('Password recovery');

				$.append($$anchor, text_2);
			},

			links: ($$anchor, $$slotProps) => {
				var fragment_8 = $.comment();
				var node_8 = $.first_child(fragment_8);

				$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
					Layout_Stack_2($$anchor, {
						direction: 'row',
						justifyContent: 'center',
						alignItems: 'center',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_2();
							var node_9 = $.first_child(fragment_9);

							{
								let $0 = $.derived(() => `${base}/login`);

								$.component(node_9, () => Link.Anchor, ($$anchor, Link_Anchor) => {
									Link_Anchor($$anchor, {
										get href() {
											return $.get($0);
										},
										variant: 'quiet',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Sign in');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								});
							}

							var div = $.sibling(node_9, 2);

							$.set_style(div, '', {}, { height: '20px' });

							var node_10 = $.child(div);

							Divider(node_10, { vertical: true });
							$.reset(div);

							var node_11 = $.sibling(div, 2);

							{
								let $0 = $.derived(() => `${base}/register`);

								$.component(node_11, () => Link.Anchor, ($$anchor, Link_Anchor_1) => {
									Link_Anchor_1($$anchor, {
										get href() {
											return $.get($0);
										},
										variant: 'quiet',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Sign up');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_8);
			}
		}
	});

	$.pop();
}