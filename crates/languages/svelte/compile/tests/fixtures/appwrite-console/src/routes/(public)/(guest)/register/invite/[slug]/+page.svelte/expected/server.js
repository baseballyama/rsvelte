import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1p83s93', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Sign up - Appwrite</title>`);
				});
			});

			Unauthenticated($$renderer, {
				imgLight,
				imgDark,
				children: ($$renderer) => {
					{
						Form($$renderer, {
							onSubmit: invite,
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										children: ($$renderer) => {
											InputText($$renderer, {
												id: 'name',
												label: 'Name',
												placeholder: 'Your name',
												autofocus: true,
												get value() {
													return name;
												},

												set value($$value) {
													name = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> `);

											InputEmail($$renderer, {
												id: 'email',
												label: 'Email',
												placeholder: 'Your email',
												required: true,
												get value() {
													return mail;
												},

												set value($$value) {
													mail = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> `);

											InputPassword($$renderer, {
												id: 'password',
												label: 'Password',
												placeholder: 'Your password',
												required: true,
												get value() {
													return pass;
												},

												set value($$value) {
													pass = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> `);

											InputText($$renderer, {
												id: 'Code',
												label: 'Code',
												placeholder: 'Your code',
												required: true,
												get value() {
													return code;
												},

												set value($$value) {
													code = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> `);

											InputChoice($$renderer, {
												required: true,
												value: terms,
												id: 'terms',
												label: 'terms',
												showLabel: false,
												children: ($$renderer) => {
													$$renderer.push(`<!---->By registering, you agree that you have read, understand, and acknowledge our <a class="link" href="https://appwrite.io/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and accept our <a class="link" href="https://appwrite.io/terms" target="_blank" rel="noopener noreferrer">General Terms of Use</a>.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												fullWidth: true,
												submit: true,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Sign up`);
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
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`${$.escape(title)}`);
						}
					},

					links: ($$renderer) => {
						{
							$$renderer.push(`<li class="inline-links-item"><span class="text">Already got an account? <a class="link"${$.attr('href', `${base}/login`)}>Sign in</a></span></li>`);
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