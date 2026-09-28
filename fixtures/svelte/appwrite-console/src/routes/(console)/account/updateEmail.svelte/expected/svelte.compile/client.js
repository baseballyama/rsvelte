import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`Email <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function UpdateEmail($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let email = null;
	let emailPassword = null;

	onMount(async () => {
		email ??= $user().email;
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

	Form($$anchor, {
		onSubmit: updateEmail,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								direction: 'row',
								gap: 's',
								alignItems: 'center',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_3 = root();
									var node_1 = $.sibling($.first_child(fragment_3));

									{
										var consequent = ($$anchor) => {
											Badge($$anchor, {
												variant: 'secondary',
												type: 'success',
												size: 's',
												content: 'verified'
											});
										};

										$.if(node_1, ($$render) => {
											if ($user().emailVerification) $$render(consequent);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_2 = $.first_child(fragment_5);

						InputText(node_2, {
							id: 'email',
							label: 'Email',
							placeholder: 'Enter email',
							required: true,
							get value() {
								return email;
							},

							set value($$value) {
								email = $$value;
							}
						});

						var node_3 = $.sibling(node_2, 2);

						{
							var consequent_1 = ($$anchor) => {
								InputPassword($$anchor, {
									id: 'emailPassword',
									label: 'Password',
									placeholder: 'Enter password',
									required: true,
									get value() {
										return emailPassword;
									},

									set value($$value) {
										emailPassword = $$value;
									}
								});
							};

							$.if(node_3, ($$render) => {
								if (email !== $user().email && email) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_5);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => email === $user().email || !email || !emailPassword);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Update');

									$.append($$anchor, text);
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