import * as $ from 'svelte/internal/server';
import { invalidate, goto } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Modal } from '$lib/components';
import { Button, InputEmail, InputPassword } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';
import { page } from '$app/state';
import Link from '$lib/elements/link.svelte';
import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
import { Dependencies } from '$lib/constants';
import { onMount, onDestroy } from 'svelte';
import { resolve } from '$app/paths';
import { browser } from '$app/environment';
import { slide } from 'svelte/transition';

export default function SendVerificationEmailModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = false, email } = $$props;
		let error = null;
		let creating = false;
		let emailSent = false;
		let resendTimer = 0;
		let timerInterval = null;
		let showUpdateEmail = false;
		let newEmail = '';
		let newPassword = '';
		let updating = false;

		async function logout() {
			error = null;

			try {
				await sdk.forConsole.account.deleteSession({ sessionId: 'current' });
				await invalidate(Dependencies.ACCOUNT);
				await goto(resolve('/login'));
			} catch(err) {
				error = err.message;
			}
		}

		const cleanUrl = $.derived(() => page.url.origin + page.url.pathname);

		// manage resend timer in localStorage
		const EMAIL_SENT_KEY = 'email_verification_sent';

		const TIMER_END_KEY = 'email_verification_timer_end';

		function startResendTimer() {
			resendTimer = 60;
			emailSent = true;

			const timerEndTime = Date.now() + 60 * 1000;

			if (browser) {
				localStorage.setItem(EMAIL_SENT_KEY, 'true');
				localStorage.setItem(TIMER_END_KEY, timerEndTime.toString());
			}

			startTimerCountdown(timerEndTime);
		}

		function restoreTimerState() {
			if (!browser) return;

			const savedTimerEnd = localStorage.getItem(TIMER_END_KEY);
			const savedEmailSent = localStorage.getItem(EMAIL_SENT_KEY);

			if (savedTimerEnd && savedEmailSent) {
				const timerEndTime = parseInt(savedTimerEnd);
				const now = Date.now();
				const remainingTime = Math.max(0, Math.ceil((timerEndTime - now) / 1000));

				if (remainingTime > 0) {
					resendTimer = remainingTime;
					emailSent = true;
					startTimerCountdown(timerEndTime);
				} else {
					// timer has expired, clean up
					localStorage.removeItem(TIMER_END_KEY);

					localStorage.removeItem(EMAIL_SENT_KEY);
					resendTimer = 0;
					emailSent = false;
				}
			}
		}

		function startTimerCountdown(timerEndTime) {
			timerInterval = setInterval(
				() => {
					const now = Date.now();
					const remainingTime = Math.max(0, Math.ceil((timerEndTime - now) / 1000));

					resendTimer = remainingTime;

					if (remainingTime <= 0) {
						clearInterval(timerInterval);
						timerInterval = null;

						if (browser) {
							localStorage.removeItem(TIMER_END_KEY);
							localStorage.removeItem(EMAIL_SENT_KEY);
						}
					}
				},
				1000
			);
		}

		async function onSubmit() {
			if (creating || resendTimer > 0) return;

			error = null;
			creating = true;

			try {
				await sdk.forConsole.account.createVerification({ url: cleanUrl() });
				emailSent = true;
				startResendTimer();
			} catch(err) {
				error = err.message;
			} finally {
				creating = false;
			}
		}

		async function updateEmail() {
			error = null;
			updating = true;

			try {
				await sdk.forConsole.account.updateEmail({ email: newEmail, password: newPassword });
				await invalidate(Dependencies.ACCOUNT);
				trackEvent(Submit.AccountUpdateEmail);
				resetUpdateEmailForm();
			} catch(err) {
				error = err.message;
				trackError(err, Submit.AccountUpdateEmail);
			} finally {
				updating = false;
			}
		}

		function resetUpdateEmailForm() {
			showUpdateEmail = false;
			newEmail = '';
			newPassword = '';
			error = null;
		}

		onMount(restoreTimerState);

		onDestroy(() => {
			if (timerInterval) {
				clearInterval(timerInterval);
			}

			if (browser) {
				localStorage.removeItem(TIMER_END_KEY);
				localStorage.removeItem(EMAIL_SENT_KEY);
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="email-verification-scrim svelte-ue0o1w">`);

			if (!showUpdateEmail) {
				$$renderer.push('<!--[0-->');

				Modal($$renderer, {
					title: 'Verify your email address',
					onSubmit,
					dismissible: false,
					autoClose: false,
					backdrop: false,
					get show() {
						return show;
					},

					set show($$value) {
						show = $$value;
						$$settled = false;
					},

					get error() {
						return error;
					},

					set error($$value) {
						error = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Card.Base) {
							$$renderer.push('<!--[-->');

							Card.Base($$renderer, {
								variant: 'secondary',
								padding: 's',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xxs',
											children: ($$renderer) => {
												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														gap: 'm',
														children: ($$renderer) => {
															$$renderer.push(`<!---->To continue using Appwrite Cloud, please verify your email address. An email
                        will be sent to `);

															if (Typography.Text) {
																$$renderer.push('<!--[-->');

																Typography.Text($$renderer, {
																	variant: 'm-600',
																	color: 'neutral-secondary',
																	style: 'display: inline;',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(email || get(user)?.email)}`);
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

												$$renderer.push(` `);

												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Wrong email? `);

															Link($$renderer, {
																variant: 'default',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Update email address`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----> or `);

															Link($$renderer, {
																variant: 'default',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Switch account`);
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

												$$renderer.push(` `);

												if (emailSent && resendTimer > 0) {
													$$renderer.push(`<!--[0--><div>`);

													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															color: 'neutral-secondary',
															style: 'margin-block-start: var(--gap-L, 16px);',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Didn't get the email? Try again in ${$.escape(resendTimer)}s`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(`</div>`);
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
						footer: ($$renderer) => {
							{
								Button($$renderer, {
									submit: true,
									submissionLoader: true,
									forceShowLoader: creating,
									disabled: creating || resendTimer > 0,
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(emailSent ? 'Resend email' : 'Send email')}`);
									},
									$$slots: { default: true }
								});
							}
						}
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');

				Modal($$renderer, {
					title: 'Update email address',
					onSubmit: updateEmail,
					autoClose: false,
					backdrop: false,
					get show() {
						return showUpdateEmail;
					},

					set show($$value) {
						showUpdateEmail = $$value;
						$$settled = false;
					},

					get error() {
						return error;
					},

					set error($$value) {
						error = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						InputEmail($$renderer, {
							id: 'new-email',
							label: 'Email',
							placeholder: 'Enter email',
							required: true,
							helper: 'You\'ll need access to this email to verify your account',
							get value() {
								return newEmail;
							},

							set value($$value) {
								newEmail = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						InputPassword($$renderer, {
							id: 'update-password',
							label: 'Password',
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
					},

					$$slots: {
						default: true,
						footer: ($$renderer) => {
							{
								Button($$renderer, {
									text: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Cancel`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									submit: true,
									submissionLoader: true,
									forceShowLoader: updating,
									disabled: updating,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Update`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							}
						}
					}
				});
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { show });
	});
}