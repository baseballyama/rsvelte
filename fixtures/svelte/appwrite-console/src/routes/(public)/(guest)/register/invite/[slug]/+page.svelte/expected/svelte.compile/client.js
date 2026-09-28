import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto, invalidate } from '$app/navigation';
import { base } from '$app/paths';

import {
	Button,
	Form,
	InputChoice,
	InputEmail,
	InputPassword,
	InputText
} from '$lib/elements/forms';

import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Unauthenticated } from '$lib/layout';
import { Dependencies } from '$lib/constants';
import { Submit, trackEvent } from '$lib/actions/analytics';
import { onMount } from 'svelte';
import { page } from '$app/state';
import LoginLight from '$lib/images/login/login-light-mode.svg';
import LoginDark from '$lib/images/login/login-dark-mode.svg';
import { isCloud } from '$lib/system';
import { Layout } from '@appwrite.io/pink-svelte';

var root = $.from_html(`By registering, you agree that you have read, understand, and acknowledge our <a class="link" href="https://appwrite.io/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and accept our <a class="link" href="https://appwrite.io/terms" target="_blank" rel="noopener noreferrer">General Terms of Use</a>.`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<li class="inline-links-item"><span class="text">Already got an account? <a class="link">Sign in</a></span></li>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let slug = page.params.slug;
	let imgLight = LoginLight;
	let imgDark = LoginDark;

	onMount(async () => {
		if (isCloud) {
			code = slug;

			switch (slug) {
				case 'mlh':
					imgDark = (await import('./mlh-dark.svg')).default;
					imgLight = (await import('./mlh-light.svg')).default;
					title = 'Welcome MLH Hackers!';
					break;

				case 'appwrite':
					imgDark = (await import('$lib/images/appwrite.svg')).default;
					imgLight = (await import('$lib/images/appwrite.svg')).default;
					title = 'Welcome Appwriters!';
					break;

				case 'cloud_beta':
					break;

				default:
					code = '';
			}
		}
	});

	let name;
	let mail;
	let pass;
	let code;
	let title = 'Sign up';
	let terms = false;

	async function invite() {
		try {
			const { endpoint, project } = sdk.forConsole.client.config;

			const res = await fetch(`${endpoint}/account/invite`, {
				method: 'POST',
				headers: {
					'X-Appwrite-Project': project,
					'Content-Type': 'application/json'
				},

				body: JSON.stringify({
					userId: 'unique()',
					email: mail,
					password: pass,
					code,
					name: name ?? ''
				})
			});

			if (!res.ok) {
				throw new Error((await res.json()).message);
			} else {
				await sdk.forConsole.account.createEmailPasswordSession({ email: mail, password: pass });

				const prefs = await sdk.forConsole.account.getPrefs();
				const newPrefs = { ...prefs, code };

				await Promise.all([
					sdk.forConsole.account.updatePrefs({ prefs: newPrefs }),
					invalidate(Dependencies.ACCOUNT)
				]);

				await goto(base);
				trackEvent(Submit.AccountCreate, { email: mail, name, code });
			}
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
		}
	}

	$.head('1p83s93', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Sign up - Appwrite';
		});
	});

	Unauthenticated($$anchor, {
		get imgLight() {
			return imgLight;
		},

		get imgDark() {
			return imgDark;
		},

		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				onSubmit: invite,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_1 = $.first_child(fragment_3);

								InputText(node_1, {
									id: 'name',
									label: 'Name',
									placeholder: 'Your name',
									autofocus: true,
									get value() {
										return name;
									},

									set value($$value) {
										name = $$value;
									}
								});

								var node_2 = $.sibling(node_1, 2);

								InputEmail(node_2, {
									id: 'email',
									label: 'Email',
									placeholder: 'Your email',
									required: true,
									get value() {
										return mail;
									},

									set value($$value) {
										mail = $$value;
									}
								});

								var node_3 = $.sibling(node_2, 2);

								InputPassword(node_3, {
									id: 'password',
									label: 'Password',
									placeholder: 'Your password',
									required: true,
									get value() {
										return pass;
									},

									set value($$value) {
										pass = $$value;
									}
								});

								var node_4 = $.sibling(node_3, 2);

								InputText(node_4, {
									id: 'Code',
									label: 'Code',
									placeholder: 'Your code',
									required: true,
									get value() {
										return code;
									},

									set value($$value) {
										code = $$value;
									}
								});

								var node_5 = $.sibling(node_4, 2);

								InputChoice(node_5, {
									required: true,
									value: terms,
									id: 'terms',
									label: 'terms',
									showLabel: false,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root();

										$.next(4);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_5, 2);

								Button(node_6, {
									fullWidth: true,
									submit: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Sign up');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, title));
				$.append($$anchor, text_1);
			},

			links: ($$anchor, $$slotProps) => {
				var li = root_2();
				var span = $.child(li);
				var a = $.sibling($.child(span));

				$.reset(span);
				$.reset(li);
				$.template_effect(() => $.set_attribute(a, 'href', `${base}/login`));
				$.append($$anchor, li);
			}
		}
	});

	$.pop();
}