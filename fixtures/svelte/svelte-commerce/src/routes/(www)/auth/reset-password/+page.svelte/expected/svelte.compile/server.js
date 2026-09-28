import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input/input.svelte';
import Button from '$lib/components/ui/button/button.svelte';
import Label from '$lib/components/ui/label/label.svelte';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '$lib/components/ui/card';

import { AlertCircle, ArrowLeft, LoaderIcon } from '@lucide/svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { ResetPasswordModule } from '$lib/core/composables/index.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const resetPasswordModule = new ResetPasswordModule();
		const userState = resetPasswordModule.userState;

		// The composable's handleSubmit takes no event, never sets isLoading and never catches, so
		// wrap it here: stop the native GET submit, block double-submits and surface failures inline.
		let submitting = false;

		let error = '';

		async function handleSubmit(e) {
			e.preventDefault();

			if (submitting) return;

			submitting = true;
			error = '';

			try {
				await resetPasswordModule.handleSubmit();
			} catch(err) {
				error = err?.message || 'We could not reset your password. The link may have expired — request a new one.';
			} finally {
				submitting = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('12zq6ye', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Reset Password</title>`);
				});
			});

			Card($$renderer, {
				class: 'mx-auto w-full max-w-md',
				children: ($$renderer) => {
					CardHeader($$renderer, {
						children: ($$renderer) => {
							CardTitle($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Reset Password`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							CardDescription($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Enter your new password to set.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardContent($$renderer, {
						children: ($$renderer) => {
							if (!resetPasswordModule.success) {
								$$renderer.push(`<!--[0--><form><div class="space-y-4"><div class="space-y-2">`);

								Label($$renderer, {
									for: 'password',
									children: ($$renderer) => {
										$$renderer.push(`<!---->New Password`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'password',
									placeholder: '********',
									type: 'password',
									disabled: !!userState.loading,
									class: 'bg-white text-gray-900 dark:bg-gray-700 dark:text-white',
									get value() {
										return resetPasswordModule.password;
									},

									set value($$value) {
										resetPasswordModule.password = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div> <div class="space-y-2">`);

								Label($$renderer, {
									for: 'retypepassword',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Confirm Password`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'retypepassword',
									placeholder: '********',
									type: 'password',
									disabled: !!userState.loading,
									class: 'bg-white text-gray-900 dark:bg-gray-700 dark:text-white',
									get value() {
										return resetPasswordModule.retype;
									},

									set value($$value) {
										resetPasswordModule.retype = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div> `);

								if (error || resetPasswordModule.error) {
									$$renderer.push(`<!--[0--><div class="flex items-center space-x-2 text-red-600" role="alert">`);
									AlertCircle($$renderer, { size: 16 });
									$$renderer.push(`<!----> <span class="text-sm">${$.escape(error || resetPasswordModule.error)}</span></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								Button($$renderer, {
									type: 'submit',
									class: 'w-full',
									disabled: submitting,
									children: ($$renderer) => {
										if (submitting) {
											$$renderer.push('<!--[0-->');
											LoaderIcon($$renderer, { class: 'mr-2 h-4 w-4 animate-spin' });
											$$renderer.push(`<!----> Loading...`);
										} else {
											$$renderer.push(`<!--[-1-->Reset Password`);
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div></form>`);
							} else {
								$$renderer.push(`<!--[-1--><div class="space-y-4 text-center"><p class="text-green-600">Password reset link sent! Check your email.</p> `);

								Button($$renderer, {
									variant: 'outline',
									class: 'w-full',
									onclick: () => resetPasswordModule.success = false,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Send another link`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardFooter($$renderer, {
						children: ($$renderer) => {
							AuthButton($$renderer, {
								type: 'login',
								children: ($$renderer) => {
									$$renderer.push(`<button class="flex items-center text-sm text-muted-foreground hover:text-primary">`);
									ArrowLeft($$renderer, { size: 16, class: 'mr-2' });
									$$renderer.push(`<!----> Back to Login</button>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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