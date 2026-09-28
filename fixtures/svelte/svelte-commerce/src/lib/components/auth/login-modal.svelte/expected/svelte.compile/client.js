import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArrowLeft, Check, LoaderIcon, X, Phone, Mail } from '@lucide/svelte';
import * as InputOTP from '$lib/components/ui/input-otp/index.js';
import Button from '$lib/components/ui/button/button.svelte';
import { Label } from '$lib/components/ui/label/index.js';
import { env } from '$env/dynamic/public';
import Textbox from '$lib/components/form/textbox.svelte';
import Modal from '../common/modal.svelte';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { dev } from '$app/environment';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { LoginModule, loginModuleSchema as schemas } from '$lib/core/composables/index.js';
import { z } from 'zod';
import { toast } from '@misiki/kitcommerce-core';
import { authService } from '$lib/core/services/index.js';
import { onDestroy, onMount } from 'svelte';

var root = $.from_html(`<div class="mb-1 flex h-10 items-center justify-center"><img class="h-9 object-contain dark:brightness-110"/></div>`);
var root_1 = $.from_html(`<div class="mb-1 flex h-12 w-12 items-center justify-center rounded-radius bg-muted shadow-sm ring-1 ring-border"><span class="text-lg font-bold text-gray-900 dark:text-white"> </span></div>`);
var root_2 = $.from_html(`<div class="relative flex w-full rounded-radius bg-gray-100/80 p-1.5 shadow-inner dark:bg-gray-800/80"><div class="absolute left-1.5 top-1.5 flex h-[calc(100%-12px)] w-[calc(50%-6px)] rounded-radius bg-white shadow-sm transition-transform duration-300 ease-in-out dark:bg-gray-700"></div> <button type="button"><!> Phone</button> <button type="button"><!> Email</button></div>`);
var root_3 = $.from_html(`<div class="space-y-2"><!> <!></div>`);
var root_4 = $.from_html(`<div class="flex items-center justify-center gap-2"><div class="flex items-center justify-end"><!></div></div>`);
var root_5 = $.from_html(`<!> Sending OTP...`, 1);
var root_6 = $.from_html(`<!> Signing in...`, 1);
var root_7 = $.from_html(`<div class="pt-2 text-center"><p class="text-sm text-gray-500 dark:text-gray-400"> <!></p></div>`);
var root_8 = $.from_html(`<div class="pt-0.5"><a href="/auth/join-as-vendor" class="font-medium text-gray-600 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white">Join as a Vendor</a></div>`);
var root_9 = $.from_html(`<div class="flex flex-col items-center space-y-3 pb-2 text-center max-sm:pt-5"><!> <div class="space-y-2"><h1 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Welcome back</h1> <p class="mx-auto max-w-[30ch] text-sm leading-6 text-gray-600 dark:text-gray-300"> </p></div></div> <form class="flex flex-col space-y-5 max-sm:pt-2"><div class="space-y-4"><div class="space-y-4"><!> <div class="mt-2 space-y-2"><!> <!></div> <!></div> <!> <!> <!> <div class="space-y-1 pt-1.5 text-center text-xs leading-5 text-gray-500 dark:text-gray-400"><p>By continuing, you agree to our <a href="/terms-and-conditions" class="font-medium text-gray-700 hover:underline dark:text-gray-300">Terms & Conditions</a></p> <!></div></div></form>`, 1);
var root_10 = $.from_html(`<p class="text-xs font-semibold text-amber-700 dark:text-amber-300">Dev mode: use 1111</p>`);
var root_11 = $.from_html(`<!> Verifying...`, 1);
var root_12 = $.from_html(`Didn't get it? <button type="button" class="min-h-11 font-semibold text-gray-950 underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-white">Resend code</button>`, 1);
var root_13 = $.from_html(`<div class="flex min-h-[min(540px,100dvh)] flex-col py-1 sm:min-h-0"><div class="flex items-center justify-between"><button type="button" class="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"><!> Change number</button> <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400"><!> Code sent</span></div> <div class="mt-10 space-y-2 text-center sm:mt-8"><h2 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Check your phone</h2> <p class="text-sm leading-6 text-gray-600 dark:text-gray-300">Enter the 4-digit code sent to <span class="font-semibold text-gray-950 dark:text-white"> </span>.</p> <!></div> <div class="flex flex-1 items-center justify-center py-10 sm:py-8"><!></div> <input type="hidden" name="otp"/> <div class="space-y-4 text-center"><!> <p class="text-sm text-gray-600 dark:text-gray-300"><!></p></div></div>`);
var root_14 = $.from_html(`<div class="w-full transform space-y-6 border border-gray-100/50 bg-white p-6 shadow-2xl ring-1 ring-white/20 transition-all dark:border-gray-700 dark:bg-gray-900 dark:ring-white/5 max-sm:min-h-[100dvh] max-sm:px-5 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-[max(1rem,env(safe-area-inset-top))] sm:max-w-[480px] sm:rounded-radius sm:p-8"><div class="z-50 flex min-h-11 items-center justify-end sm:absolute sm:right-5 sm:top-5"><button aria-label="Close modal button" class="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"><!></button></div> <!></div>`);

export default function Login_modal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15, false),
		manageHistory = $.prop($$props, 'manageHistory', 3, true);

	const customPhoneSchema = z.string().refine((val) => schemas.phone.safeParse(val.replace(/\s+/g, '')).success, 'Please enter a valid phone number');
	const loginModule = new LoginModule();
	const userState = loginModule.userState;
	let resendSeconds = $.state(0);
	let otpCooldownStarted = $.state(false);
	let resendTimer;

	const recipient = $.derived(() => loginModule.identifier.length > 4
		? `${loginModule.identifier.slice(0, Math.min(4, loginModule.identifier.length - 4))}${('•').repeat(4)}${loginModule.identifier.slice(-2)}`
		: loginModule.identifier);

	const loginPrompt = $.derived(() => loginModule.isPhoneNumber
		? 'Use your phone number to receive a one-time code.'
		: 'Use your email and password to continue.');

	function startResendCooldown() {
		$.set(resendSeconds, 30);

		if (resendTimer) clearInterval(resendTimer);

		resendTimer = setInterval(
			() => {
				$.set(resendSeconds, Math.max(0, $.get(resendSeconds) - 1), true);

				if ($.get(resendSeconds) === 0 && resendTimer) {
					clearInterval(resendTimer);
					resendTimer = undefined;
				}
			},
			1000
		);
	}

	async function handleResendOtp() {
		if ($.get(resendSeconds) > 0) return;

		try {
			if (dev) {
				toast.success('OTP resent successfully (Dev Mode: 1111)');
				startResendCooldown();

				return;
			}

			await authService.getOtp({ phone: loginModule.identifier });
			toast.success('OTP resent successfully');
			startResendCooldown();
		} catch(e) {
			toast.error(e.message || 'Failed to resend OTP');
		}
	}

	$.user_effect(() => {
		if (loginModule.step === 2 && loginModule.otpInputRef) {
			const el = loginModule.otpInputRef;
			const input = el.querySelector('input');

			if (input) {
				input.focus();
			} else {
				el.focus();
			}
		}
	});

	$.user_effect(() => {
		if (loginModule.step === 2 && !$.get(otpCooldownStarted)) {
			$.set(otpCooldownStarted, true);
			startResendCooldown();
		} else if (loginModule.step !== 2) {
			$.set(otpCooldownStarted, false);
		}
	});

	$.user_effect(() => {
		if (show()) {
			loginModule.step = 1;
			loginModule.otp = '';
			loginModule.identifier = '';
			$.set(verifiedOtp, '');
		}
	});

	onMount(() => {
		if (dev) {
			// Purge any dev-session mock cookies to avoid remote API validation errors.
			// Keyed off `me`, since a real connect.sid is httpOnly and unreadable here.
			if (document.cookie.includes('dev_user')) {
				document.cookie = 'connect.sid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
				document.cookie = 'me=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
			}

			// Monkey patch send OTP to intercept rate limit error
			const originalGetOtp = authService.getOtp;

			authService.getOtp = async (args) => {
				try {
					return await originalGetOtp.call(authService, args);
				} catch(err) {
					if (err.message?.includes('Please wait') || err.message?.includes('cooldown') || err.status === 429) {
						toast.success('Dev Mode: Rate limit bypassed. Use OTP 1111');
						loginModule.step = 2;

						setTimeout(
							() => {
								loginModule.otpInputRef?.focus();
							},
							100
						);

						return { success: true, message: 'Bypassed' };
					}

					throw err;
				}
			};

			// Monkey patch verify OTP to support 1111 bypass on rate limit failover
			const originalVerifyOtp = authService.verifyOtp;

			authService.verifyOtp = async (args) => {
				if (args.otp === '1111') {
					const mockUser = {
						id: 'dev_user',
						// UserState gates on me.userId, so the mock must carry one too
						userId: 'dev_user',
						phone: args.phone,
						firstName: 'Dev',
						lastName: 'User',
						role: 'user'
					};

					document.cookie = `connect.sid=dev-session; path=/; max-age=${60 * 60 * 24 * 30}`;
					document.cookie = `me=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=${60 * 60 * 24 * 30}`;
					userState.user = mockUser;
					show(false);

					return mockUser;
				}

				return await originalVerifyOtp.call(authService, args);
			};
		}
	});

	onDestroy(() => {
		if (resendTimer) clearInterval(resendTimer);
	});

	let verifiedOtp = $.state('');

	// userState.verifyOtp ends in a hardcoded `goto('/')` for the USER role and never reads
	// `?redirect=`, so every shopper who logged in by phone — including from the "log in to use
	// your saved addresses" prompt at checkout, and anyone bounced off /my/* — was dumped on the
	// homepage and had to find their way back. The password path already honours `redirect`; this
	// re-applies it for OTP. Issuing the second goto as soon as verification resolves supersedes
	// the in-flight one rather than landing on the homepage first.
	async function verifyOtpThenRedirect() {
		const redirectTo = new URLSearchParams(window.location.search).get('redirect');

		await loginModule.handleVerifyOtp();

		if (redirectTo && userState.user) goto(decodeURIComponent(redirectTo));
	}

	$.user_effect(() => {
		if (loginModule.otp.length === 4 && loginModule.otp !== $.get(verifiedOtp) && !loginModule.isLoading && !userState.loading) {
			$.set(verifiedOtp, loginModule.otp, true);
			verifyOtpThenRedirect();
		} else if (loginModule.otp.length !== 4) {
			$.set(verifiedOtp, '');
		}
	});

	Modal($$anchor, {
		get manageHistory() {
			return manageHistory();
		},
		rounded: false,
		hideHeader: true,
		hideFooter: true,
		useMaxHeight: true,
		class: 'p-0 max-sm:h-screen max-sm:w-screen max-sm:!rounded-none',
		hAuto: true,
		wAuto: true,
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var div = root_14();
			var div_1 = $.child(div);
			var button = $.child(div_1);
			var node = $.child(button);

			X(node, { class: 'h-5 w-5' });
			$.reset(button);
			$.reset(div_1);

			var node_1 = $.sibling(div_1, 2);

			{
				var consequent_11 = ($$anchor) => {
					var fragment_1 = root_9();
					var div_2 = $.first_child(fragment_1);
					var node_2 = $.child(div_2);

					{
						var consequent = ($$anchor) => {
							var div_3 = root();
							var img = $.only_child(div_3);

							$.template_effect(() => {
								$.set_attribute(img, 'src', page.data.store.logo);
								$.set_attribute(img, 'alt', page.data.store.name);
							});

							$.append($$anchor, div_3);
						};

						var alternate = ($$anchor) => {
							var div_4 = root_1();
							var span = $.child(div_4);
							var text = $.only_child(span, true);

							$.reset(div_4);
							$.template_effect(($0) => $.set_text(text, $0), [() => page?.data?.store?.name?.charAt(0) || 'L']);
							$.append($$anchor, div_4);
						};

						$.if(node_2, ($$render) => {
							if (page?.data?.store?.logo) $$render(consequent); else $$render(alternate, -1);
						});
					}

					var div_5 = $.sibling(node_2, 2);
					var p = $.sibling($.child(div_5), 2);
					var text_1 = $.only_child(p, true);

					$.reset(div_5);
					$.reset(div_2);

					var form = $.sibling(div_2, 2);
					var div_6 = $.child(form);
					var div_7 = $.child(div_6);
					var node_3 = $.child(div_7);

					{
						var consequent_1 = ($$anchor) => {
							var div_8 = root_2();
							var div_9 = $.child(div_8);
							let styles;
							var button_1 = $.sibling(div_9, 2);
							var node_4 = $.child(button_1);

							Phone(node_4, { class: 'h-4 w-4' });
							$.next();
							$.reset(button_1);

							var button_2 = $.sibling(button_1, 2);
							var node_5 = $.child(button_2);

							Mail(node_5, { class: 'h-4 w-4' });
							$.next();
							$.reset(button_2);
							$.reset(div_8);

							$.template_effect(() => {
								styles = $.set_style(div_9, '', styles, {
									transform: loginModule.isPhoneNumber ? 'translateX(0)' : 'translateX(100%)'
								});

								$.set_class(button_1, 1, `relative z-10 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-radius py-2.5 text-sm font-semibold transition-colors ${loginModule.isPhoneNumber
									? 'text-gray-900 dark:text-white'
									: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`);

								$.set_class(button_2, 1, `relative z-10 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-radius py-2.5 text-sm font-semibold transition-colors ${!loginModule.isPhoneNumber
									? 'text-gray-900 dark:text-white'
									: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`);
							});

							$.delegated('click', button_1, () => !loginModule.isPhoneNumber && loginModule.switchLoginType());
							$.delegated('click', button_2, () => loginModule.isPhoneNumber && loginModule.switchLoginType());
							$.append($$anchor, div_8);
						};

						$.if(node_3, ($$render) => {
							if (!page.data.store?.loginType || page.data.store?.loginType == 'BOTH') $$render(consequent_1);
						});
					}

					var div_10 = $.sibling(node_3, 2);
					var node_6 = $.child(div_10);

					Label(node_6, {
						for: 'identifier',
						class: 'mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_7 = $.first_child(fragment_2);

							{
								var consequent_4 = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_8 = $.first_child(fragment_3);

									{
										var consequent_2 = ($$anchor) => {
											var text_2 = $.text('Phone Number');

											$.append($$anchor, text_2);
										};

										var consequent_3 = ($$anchor) => {
											var text_3 = $.text('Email Address');

											$.append($$anchor, text_3);
										};

										var alternate_1 = ($$anchor) => {
											var text_4 = $.text();

											$.template_effect(() => $.set_text(text_4, loginModule.isPhoneNumber ? 'Phone Number' : 'Email Address'));
											$.append($$anchor, text_4);
										};

										$.if(node_8, ($$render) => {
											if (page.data.store?.loginType === 'PHONE') $$render(consequent_2); else if (page.data.store?.loginType === 'EMAIL') $$render(consequent_3, 1); else $$render(alternate_1, -1);
										});
									}

									$.append($$anchor, fragment_3);
								};

								var alternate_2 = ($$anchor) => {
									var text_5 = $.text();

									$.template_effect(() => $.set_text(text_5, loginModule.isPhoneNumber ? 'Phone Number' : 'Email Address'));
									$.append($$anchor, text_5);
								};

								$.if(node_7, ($$render) => {
									if (loginModule.identifier.length === 0) $$render(consequent_4); else $$render(alternate_2, -1);
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_6, 2);

					$.key(node_9, () => loginModule.isPhoneNumber, ($$anchor) => {
						{
							let $0 = $.derived(() => loginModule.isPhoneNumber ? '+91234567890' : 'johndoe@gmail.com');
							let $1 = $.derived(() => loginModule.isPhoneNumber ? 'tel' : 'email');
							let $2 = $.derived(() => loginModule.isPhoneNumber ? customPhoneSchema : schemas.email);

							Textbox($$anchor, {
								name: 'identifier',
								get placeholder() {
									return $.get($0);
								},

								get type() {
									return $.get($1);
								},

								get schema() {
									return $.get($2);
								},

								oninput: (e) => {
									if (loginModule.isPhoneNumber) {
										const target = e.target;
										const current = target.value;
										const cleaned = current.replace(/[^\d\+\s]/g, '');

										if (current !== cleaned) {
											const start = target.selectionStart;

											target.value = cleaned;
											loginModule.identifier = cleaned;

											if (start !== null) {
												target.setSelectionRange(start - 1, start - 1);
											}
										} else {
											loginModule.identifier = current;
										}
									}
								},
								class: 'h-14 text-base',
								required: true,
								get value() {
									return loginModule.identifier;
								},

								set value($$value) {
									loginModule.identifier = $$value;
								}
							});
						}
					});

					$.reset(div_10);

					var node_10 = $.sibling(div_10, 2);

					{
						var consequent_5 = ($$anchor) => {
							var div_11 = root_3();
							var node_11 = $.child(div_11);

							Label(node_11, {
								for: 'password',
								class: 'text-sm font-medium text-gray-700 dark:text-gray-300',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Password');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							Textbox(node_12, {
								name: 'password',
								type: 'password',
								placeholder: 'Enter your password',
								get schema() {
									return schemas.password;
								},
								class: 'h-12',
								required: true,
								get value() {
									return loginModule.password;
								},

								set value($$value) {
									loginModule.password = $$value;
								}
							});

							$.reset(div_11);
							$.append($$anchor, div_11);
						};

						$.if(node_10, ($$render) => {
							if (!loginModule.isPhoneNumber) $$render(consequent_5);
						});
					}

					$.reset(div_7);

					var node_13 = $.sibling(div_7, 2);

					{
						var consequent_6 = ($$anchor) => {
							var div_12 = root_4();
							var div_13 = $.child(div_12);
							var node_14 = $.child(div_13);

							{
								let $0 = $.derived(() => ({ email: loginModule.identifier }));

								AuthButton(node_14, {
									type: 'forgot-password',
									get extraqueries() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'link',
											class: '-mr-4 text-sm text-gray-600 hover:text-gray-500',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Forgot password?');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_13);
							$.reset(div_12);
							$.append($$anchor, div_12);
						};

						$.if(node_13, ($$render) => {
							if (!loginModule.isPhoneNumber) $$render(consequent_6);
						});
					}

					var node_15 = $.sibling(node_13, 2);

					{
						let $0 = $.derived(() => userState.loading || loginModule.isLoading);

						Button(node_15, {
							type: 'submit',
							class: 'mt-2 h-14 w-full text-wrap px-4 py-2 text-base font-semibold shadow-sm transition-colors',
							get disabled() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_8 = $.comment();
								var node_16 = $.first_child(fragment_8);

								{
									var consequent_7 = ($$anchor) => {
										var fragment_9 = root_5();
										var node_17 = $.first_child(fragment_9);

										LoaderIcon(node_17, { class: 'mr-2 h-5 w-5 animate-spin' });
										$.next();
										$.append($$anchor, fragment_9);
									};

									var consequent_8 = ($$anchor) => {
										var fragment_10 = root_6();
										var node_18 = $.first_child(fragment_10);

										LoaderIcon(node_18, { class: 'mr-2 h-5 w-5 animate-spin' });
										$.next();
										$.append($$anchor, fragment_10);
									};

									var alternate_3 = ($$anchor) => {
										var text_8 = $.text();

										$.template_effect(() => $.set_text(text_8, loginModule.isPhoneNumber ? 'Send OTP' : 'Sign In'));
										$.append($$anchor, text_8);
									};

									$.if(node_16, ($$render) => {
										if (loginModule.isPhoneNumber && (loginModule.isLoading || userState.loading)) $$render(consequent_7); else if (userState.loading && !loginModule.isPhoneNumber) $$render(consequent_8, 1); else $$render(alternate_3, -1);
									});
								}

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					}

					var node_19 = $.sibling(node_15, 2);

					{
						var consequent_9 = ($$anchor) => {
							var div_14 = root_7();
							var p_1 = $.child(div_14);
							var text_9 = $.child(p_1);
							var node_20 = $.sibling(text_9);

							AuthButton(node_20, {
								type: 'signup',
								class: 'ml-1 font-semibold text-gray-900 hover:underline dark:text-white',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_10 = $.text('Create an account');

									$.append($$anchor, text_10);
								},
								$$slots: { default: true }
							});

							$.reset(p_1);
							$.reset(div_14);
							$.template_effect(() => $.set_text(text_9, `New to ${page?.data?.store?.name ?? ''}? `));
							$.append($$anchor, div_14);
						};

						$.if(node_19, ($$render) => {
							if (loginModule.showSignupButton && page.data.store?.loginType !== 'PHONE') $$render(consequent_9);
						});
					}

					var div_15 = $.sibling(node_19, 2);
					var p_2 = $.child(div_15);
					var a = $.sibling($.child(p_2));

					$.reset(p_2);

					var node_21 = $.sibling(p_2, 2);

					{
						var consequent_10 = ($$anchor) => {
							var div_16 = root_8();
							var a_1 = $.only_child(div_16);

							$.delegated('click', a_1, () => show(false));
							$.append($$anchor, div_16);
						};

						$.if(node_21, ($$render) => {
							if (page?.data?.store?.plugins?.isMultiVendor?.active) $$render(consequent_10);
						});
					}

					$.reset(div_15);
					$.reset(div_6);
					$.reset(form);
					$.template_effect(() => $.set_text(text_1, $.get(loginPrompt)));

					$.event('submit', form, async (e) => {
						if (loginModule.isPhoneNumber) {
							let phone = loginModule.identifier.replace(/\s+/g, '');

							if (phone && !phone.startsWith('+')) {
								const dialCode = page?.data?.store?.storeCountry?.dialCode || '+91';

								phone = dialCode + phone;
							}

							loginModule.identifier = phone;
						}

						const success = await loginModule.handleSubmit(e);

						if (success) {
							loginModule.removeUrlParams();
							show(false);
						}
					});

					$.delegated('click', a, () => show(false));
					$.append($$anchor, fragment_1);
				};

				var consequent_15 = ($$anchor) => {
					var div_17 = root_13();
					var div_18 = $.child(div_17);
					var button_3 = $.child(div_18);
					var node_22 = $.child(button_3);

					ArrowLeft(node_22, { class: 'h-4 w-4' });
					$.next();
					$.reset(button_3);

					var span_1 = $.sibling(button_3, 2);
					var node_23 = $.child(span_1);

					Check(node_23, { class: 'h-3.5 w-3.5 text-primary' });
					$.next();
					$.reset(span_1);
					$.reset(div_18);

					var div_19 = $.sibling(div_18, 2);
					var p_3 = $.sibling($.child(div_19), 2);
					var span_2 = $.sibling($.child(p_3));
					var text_11 = $.only_child(span_2, true);

					$.next();
					$.reset(p_3);

					var node_24 = $.sibling(p_3, 2);

					{
						var consequent_12 = ($$anchor) => {
							var p_4 = root_10();

							$.append($$anchor, p_4);
						};

						$.if(node_24, ($$render) => {
							if (dev) $$render(consequent_12);
						});
					}

					$.reset(div_19);

					var div_20 = $.sibling(div_19, 2);
					var node_25 = $.child(div_20);

					{
						const children = ($$anchor, $$arg0) => {
							let cells = () => ($$arg0?.()).cells;
							var fragment_12 = $.comment();
							var node_26 = $.first_child(fragment_12);

							$.component(node_26, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
								InputOTP_Group($$anchor, {
									class: 'gap-2.5 sm:gap-3',
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = $.comment();
										var node_27 = $.first_child(fragment_13);

										$.each(node_27, 17, cells, $.index, ($$anchor, cell) => {
											var fragment_14 = $.comment();
											var node_28 = $.first_child(fragment_14);

											{
												let $0 = $.derived(() => $.get(cell).isActive ? 'border-primary ring-2 ring-primary/35' : '');

												$.component(node_28, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
													InputOTP_Slot($$anchor, {
														get cell() {
															return $.get(cell);
														},

														get class() {
															return `h-14 w-12 rounded-md border border-gray-300 bg-white text-xl font-bold shadow-sm transition-colors dark:border-gray-600 dark:bg-gray-900 ${$.get($0) ?? ''}`;
														}
													});
												});
											}

											$.append($$anchor, fragment_14);
										});

										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_12);
						};

						$.component(node_25, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
							InputOTP_Root($$anchor, {
								'aria-label': 'Four digit verification code',
								maxlength: 4,
								pattern: '\\d*',
								get value() {
									return loginModule.otp;
								},

								set value($$value) {
									loginModule.otp = $$value;
								},

								get ref() {
									return loginModule.otpInputRef;
								},

								set ref($$value) {
									loginModule.otpInputRef = $$value;
								},
								children,
								$$slots: { default: true }
							});
						});
					}

					$.reset(div_20);

					var input_1 = $.sibling(div_20, 2);

					$.remove_input_defaults(input_1);

					var div_21 = $.sibling(input_1, 2);
					var node_29 = $.child(div_21);

					{
						let $0 = $.derived(() => loginModule.otp.length !== 4 || userState.loading);

						Button(node_29, {
							class: 'h-12 w-full text-base font-semibold shadow-sm',
							get onclick() {
								return loginModule.handleVerifyOtp;
							},

							get disabled() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_15 = $.comment();
								var node_30 = $.first_child(fragment_15);

								{
									var consequent_13 = ($$anchor) => {
										var fragment_16 = root_11();
										var node_31 = $.first_child(fragment_16);

										LoaderIcon(node_31, { class: 'mr-2 h-5 w-5 animate-spin' });
										$.next();
										$.append($$anchor, fragment_16);
									};

									var alternate_4 = ($$anchor) => {
										var text_12 = $.text('Continue');

										$.append($$anchor, text_12);
									};

									$.if(node_30, ($$render) => {
										if (userState.loading) $$render(consequent_13); else $$render(alternate_4, -1);
									});
								}

								$.append($$anchor, fragment_15);
							},
							$$slots: { default: true }
						});
					}

					var p_5 = $.sibling(node_29, 2);
					var node_32 = $.child(p_5);

					{
						var consequent_14 = ($$anchor) => {
							var text_13 = $.text();

							$.template_effect(() => $.set_text(text_13, `Resend code in ${$.get(resendSeconds) ?? ''}s`));
							$.append($$anchor, text_13);
						};

						var alternate_5 = ($$anchor) => {
							var fragment_18 = root_12();
							var button_4 = $.sibling($.first_child(fragment_18));

							$.delegated('click', button_4, handleResendOtp);
							$.append($$anchor, fragment_18);
						};

						$.if(node_32, ($$render) => {
							if ($.get(resendSeconds) > 0) $$render(consequent_14); else $$render(alternate_5, -1);
						});
					}

					$.reset(p_5);
					$.reset(div_21);
					$.reset(div_17);
					$.template_effect(() => $.set_text(text_11, $.get(recipient)));
					$.delegated('click', button_3, () => loginModule.step = 1);
					$.bind_value(input_1, () => loginModule.otp, ($$value) => loginModule.otp = $$value);
					$.append($$anchor, div_17);
				};

				$.if(node_1, ($$render) => {
					if (loginModule.step === 1) $$render(consequent_11); else if (loginModule.step === 2) $$render(consequent_15, 1);
				});
			}

			$.reset(div);

			$.delegated('click', button, () => {
				show(false);
				loginModule.removeUrlParams();
			});

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);