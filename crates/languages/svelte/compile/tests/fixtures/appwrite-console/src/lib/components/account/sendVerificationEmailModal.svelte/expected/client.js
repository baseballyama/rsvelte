import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(
	`To continue using Appwrite Cloud, please verify your email address. An email
                        will be sent to <!>`,
	1
);

var root_1 = $.from_html(`Wrong email? <!> or <!>`, 1);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="email-verification-scrim svelte-ue0o1w"><!></div>`);

export default function SendVerificationEmailModal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15, false);
	let error = $.state(null);
	let creating = $.state(false);
	let emailSent = $.state(false);
	let resendTimer = $.state(0);
	let timerInterval = null;
	let showUpdateEmail = $.state(false);
	let newEmail = $.state('');
	let newPassword = $.state('');
	let updating = $.state(false);

	$.user_effect(() => {
		if ($.get(showUpdateEmail)) {
			$.set(newEmail, $$props.email || get(user)?.email || '', true);
		}
	});

	async function logout() {
		$.set(error, null);

		try {
			await sdk.forConsole.account.deleteSession({ sessionId: 'current' });
			await invalidate(Dependencies.ACCOUNT);
			await goto(resolve('/login'));
		} catch(err) {
			$.set(error, err.message, true);
		}
	}

	const cleanUrl = $.derived(() => page.url.origin + page.url.pathname);

	// manage resend timer in localStorage
	const EMAIL_SENT_KEY = 'email_verification_sent';

	const TIMER_END_KEY = 'email_verification_timer_end';

	function startResendTimer() {
		$.set(resendTimer, 60);
		$.set(emailSent, true);

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
				$.set(resendTimer, remainingTime, true);
				$.set(emailSent, true);
				startTimerCountdown(timerEndTime);
			} else {
				// timer has expired, clean up
				localStorage.removeItem(TIMER_END_KEY);

				localStorage.removeItem(EMAIL_SENT_KEY);
				$.set(resendTimer, 0);
				$.set(emailSent, false);
			}
		}
	}

	function startTimerCountdown(timerEndTime) {
		timerInterval = setInterval(
			() => {
				const now = Date.now();
				const remainingTime = Math.max(0, Math.ceil((timerEndTime - now) / 1000));

				$.set(resendTimer, remainingTime, true);

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
		if ($.get(creating) || $.get(resendTimer) > 0) return;

		$.set(error, null);
		$.set(creating, true);

		try {
			await sdk.forConsole.account.createVerification({ url: $.get(cleanUrl) });
			$.set(emailSent, true);
			startResendTimer();
		} catch(err) {
			$.set(error, err.message, true);
		} finally {
			$.set(creating, false);
		}
	}

	async function updateEmail() {
		$.set(error, null);
		$.set(updating, true);

		try {
			await sdk.forConsole.account.updateEmail({ email: $.get(newEmail), password: $.get(newPassword) });
			await invalidate(Dependencies.ACCOUNT);
			trackEvent(Submit.AccountUpdateEmail);
			resetUpdateEmailForm();
		} catch(err) {
			$.set(error, err.message, true);
			trackError(err, Submit.AccountUpdateEmail);
		} finally {
			$.set(updating, false);
		}
	}

	function resetUpdateEmailForm() {
		$.set(showUpdateEmail, false);
		$.set(newEmail, '');
		$.set(newPassword, '');
		$.set(error, null);
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

	var div = root_5();
	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			Modal($$anchor, {
				title: 'Verify your email address',
				onSubmit,
				dismissible: false,
				autoClose: false,
				backdrop: false,
				get show() {
					return show();
				},

				set show($$value) {
					show($$value);
				},

				get error() {
					return $.get(error);
				},

				set error($$value) {
					$.set(error, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => Card.Base, ($$anchor, Card_Base) => {
						Card_Base($$anchor, {
							variant: 'secondary',
							padding: 's',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
									Layout_Stack($$anchor, {
										gap: 'xxs',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_3();
											var node_3 = $.first_child(fragment_3);

											$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
												Typography_Text($$anchor, {
													gap: 'm',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_4 = root();
														var node_4 = $.sibling($.first_child(fragment_4));

														$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text_1) => {
															Typography_Text_1($$anchor, {
																variant: 'm-600',
																color: 'neutral-secondary',
																style: 'display: inline;',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text = $.text();

																	$.template_effect(($0) => $.set_text(text, $0), [() => $$props.email || get(user)?.email]);
																	$.append($$anchor, text);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var node_5 = $.sibling(node_3, 2);

											$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text_2) => {
												Typography_Text_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_6 = root_1();
														var node_6 = $.sibling($.first_child(fragment_6));

														Link(node_6, {
															variant: 'default',
															$$events: {
																click: () => {
																	$.set(showUpdateEmail, true);
																	$.set(error, null);
																}
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Update email address');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});

														var node_7 = $.sibling(node_6, 2);

														Link(node_7, {
															variant: 'default',
															$$events: { click: () => logout() },
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Switch account');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											var node_8 = $.sibling(node_5, 2);

											{
												var consequent = ($$anchor) => {
													var div_1 = root_2();
													var node_9 = $.child(div_1);

													$.component(node_9, () => Typography.Text, ($$anchor, Typography_Text_3) => {
														Typography_Text_3($$anchor, {
															color: 'neutral-secondary',
															style: 'margin-block-start: var(--gap-L, 16px);',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text();

																$.template_effect(() => $.set_text(text_3, `Didn't get the email? Try again in ${$.get(resendTimer) ?? ''}s`));
																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.reset(div_1);
													$.transition(3, div_1, () => slide, () => ({ duration: 150 }));
													$.append($$anchor, div_1);
												};

												$.if(node_8, ($$render) => {
													if ($.get(emailSent) && $.get(resendTimer) > 0) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},

				$$slots: {
					default: true,
					footer: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $.get(creating) || $.get(resendTimer) > 0);

							Button($$anchor, {
								submit: true,
								submissionLoader: true,
								get forceShowLoader() {
									return $.get(creating);
								},

								get disabled() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text();

									$.template_effect(() => $.set_text(text_4, $.get(emailSent) ? 'Resend email' : 'Send email'));
									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});
		};

		var alternate = ($$anchor) => {
			Modal($$anchor, {
				title: 'Update email address',
				onSubmit: updateEmail,
				autoClose: false,
				backdrop: false,
				get show() {
					return $.get(showUpdateEmail);
				},

				set show($$value) {
					$.set(showUpdateEmail, $$value, true);
				},

				get error() {
					return $.get(error);
				},

				set error($$value) {
					$.set(error, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_4();
					var node_10 = $.first_child(fragment_11);

					InputEmail(node_10, {
						id: 'new-email',
						label: 'Email',
						placeholder: 'Enter email',
						required: true,
						helper: 'You\'ll need access to this email to verify your account',
						get value() {
							return $.get(newEmail);
						},

						set value($$value) {
							$.set(newEmail, $$value, true);
						}
					});

					var node_11 = $.sibling(node_10, 2);

					InputPassword(node_11, {
						id: 'update-password',
						label: 'Password',
						placeholder: 'Enter password',
						required: true,
						get value() {
							return $.get(newPassword);
						},

						set value($$value) {
							$.set(newPassword, $$value, true);
						}
					});

					$.append($$anchor, fragment_11);
				},

				$$slots: {
					default: true,
					footer: ($$anchor, $$slotProps) => {
						var fragment_12 = root_4();
						var node_12 = $.first_child(fragment_12);

						Button(node_12, {
							text: true,
							$$events: { click: resetUpdateEmailForm },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Cancel');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						var node_13 = $.sibling(node_12, 2);

						Button(node_13, {
							submit: true,
							submissionLoader: true,
							get forceShowLoader() {
								return $.get(updating);
							},

							get disabled() {
								return $.get(updating);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Update');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_12);
					}
				}
			});
		};

		$.if(node, ($$render) => {
			if (!$.get(showUpdateEmail)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}