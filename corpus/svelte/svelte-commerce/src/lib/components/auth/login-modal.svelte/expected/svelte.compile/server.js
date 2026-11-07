import * as $ from 'svelte/internal/server';
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

export default function Login_modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = false, manageHistory = true } = $$props;
		const customPhoneSchema = z.string().refine((val) => schemas.phone.safeParse(val.replace(/\s+/g, '')).success, 'Please enter a valid phone number');
		const loginModule = new LoginModule();
		const userState = loginModule.userState;
		let resendSeconds = 0;
		let otpCooldownStarted = false;
		let resendTimer;

		const recipient = $.derived(() => loginModule.identifier.length > 4
			? `${loginModule.identifier.slice(0, Math.min(4, loginModule.identifier.length - 4))}${('•').repeat(4)}${loginModule.identifier.slice(-2)}`
			: loginModule.identifier);

		const loginPrompt = $.derived(() => loginModule.isPhoneNumber
			? 'Use your phone number to receive a one-time code.'
			: 'Use your email and password to continue.');

		function startResendCooldown() {
			resendSeconds = 30;

			if (resendTimer) clearInterval(resendTimer);

			resendTimer = setInterval(
				() => {
					resendSeconds = Math.max(0, resendSeconds - 1);

					if (resendSeconds === 0 && resendTimer) {
						clearInterval(resendTimer);
						resendTimer = undefined;
					}
				},
				1000
			);
		}

		async function handleResendOtp() {
			if (resendSeconds > 0) return;

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
						show = false;

						return mockUser;
					}

					return await originalVerifyOtp.call(authService, args);
				};
			}
		});

		onDestroy(() => {
			if (resendTimer) clearInterval(resendTimer);
		});

		let verifiedOtp = '';

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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				manageHistory,
				rounded: false,
				hideHeader: true,
				hideFooter: true,
				useMaxHeight: true,
				class: 'p-0 max-sm:h-screen max-sm:w-screen max-sm:!rounded-none',
				hAuto: true,
				wAuto: true,
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div class="w-full transform space-y-6 border border-gray-100/50 bg-white p-6 shadow-2xl ring-1 ring-white/20 transition-all dark:border-gray-700 dark:bg-gray-900 dark:ring-white/5 max-sm:min-h-[100dvh] max-sm:px-5 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-[max(1rem,env(safe-area-inset-top))] sm:max-w-[480px] sm:rounded-radius sm:p-8"><div class="z-50 flex min-h-11 items-center justify-end sm:absolute sm:right-5 sm:top-5"><button aria-label="Close modal button" class="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">`);
					X($$renderer, { class: 'h-5 w-5' });
					$$renderer.push(`<!----></button></div> `);

					if (loginModule.step === 1) {
						$$renderer.push(`<!--[0--><div class="flex flex-col items-center space-y-3 pb-2 text-center max-sm:pt-5">`);

						if (page?.data?.store?.logo) {
							$$renderer.push(`<!--[0--><div class="mb-1 flex h-10 items-center justify-center"><img${$.attr('src', page.data.store.logo)}${$.attr('alt', page.data.store.name)} class="h-9 object-contain dark:brightness-110"/></div>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="mb-1 flex h-12 w-12 items-center justify-center rounded-radius bg-muted shadow-sm ring-1 ring-border"><span class="text-lg font-bold text-gray-900 dark:text-white">${$.escape(page?.data?.store?.name?.charAt(0) || 'L')}</span></div>`);
						}

						$$renderer.push(`<!--]--> <div class="space-y-2"><h1 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Welcome back</h1> <p class="mx-auto max-w-[30ch] text-sm leading-6 text-gray-600 dark:text-gray-300">${$.escape(loginPrompt())}</p></div></div> <form class="flex flex-col space-y-5 max-sm:pt-2"><div class="space-y-4"><div class="space-y-4">`);

						if (!page.data.store?.loginType || page.data.store?.loginType == 'BOTH') {
							$$renderer.push(`<!--[0--><div class="relative flex w-full rounded-radius bg-gray-100/80 p-1.5 shadow-inner dark:bg-gray-800/80"><div class="absolute left-1.5 top-1.5 flex h-[calc(100%-12px)] w-[calc(50%-6px)] rounded-radius bg-white shadow-sm transition-transform duration-300 ease-in-out dark:bg-gray-700"${$.attr_style('', {
								transform: loginModule.isPhoneNumber ? 'translateX(0)' : 'translateX(100%)'
							})}></div> <button type="button"${$.attr_class(`relative z-10 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-radius py-2.5 text-sm font-semibold transition-colors ${loginModule.isPhoneNumber
								? 'text-gray-900 dark:text-white'
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`)}>`);

							Phone($$renderer, { class: 'h-4 w-4' });

							$$renderer.push(`<!----> Phone</button> <button type="button"${$.attr_class(`relative z-10 flex min-h-11 flex-1 items-center justify-center gap-2 rounded-radius py-2.5 text-sm font-semibold transition-colors ${!loginModule.isPhoneNumber
								? 'text-gray-900 dark:text-white'
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`)}>`);

							Mail($$renderer, { class: 'h-4 w-4' });
							$$renderer.push(`<!----> Email</button></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div class="mt-2 space-y-2">`);

						Label($$renderer, {
							for: 'identifier',
							class: 'mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200',
							children: ($$renderer) => {
								if (loginModule.identifier.length === 0) {
									$$renderer.push('<!--[0-->');

									if (page.data.store?.loginType === 'PHONE') {
										$$renderer.push(`<!--[0-->Phone Number`);
									} else if (page.data.store?.loginType === 'EMAIL') {
										$$renderer.push(`<!--[1-->Email Address`);
									} else {
										$$renderer.push(`<!--[-1-->${$.escape(loginModule.isPhoneNumber ? 'Phone Number' : 'Email Address')}`);
									}

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push(`<!--[-1-->${$.escape(loginModule.isPhoneNumber ? 'Phone Number' : 'Email Address')}`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!---->`);

						{
							Textbox($$renderer, {
								name: 'identifier',
								placeholder: loginModule.isPhoneNumber ? '+91234567890' : 'johndoe@gmail.com',
								type: loginModule.isPhoneNumber ? 'tel' : 'email',
								schema: loginModule.isPhoneNumber ? customPhoneSchema : schemas.email,
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
									$$settled = false;
								}
							});
						}

						$$renderer.push(`<!----></div> `);

						if (!loginModule.isPhoneNumber) {
							$$renderer.push(`<!--[0--><div class="space-y-2">`);

							Label($$renderer, {
								for: 'password',
								class: 'text-sm font-medium text-gray-700 dark:text-gray-300',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Password`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Textbox($$renderer, {
								name: 'password',
								type: 'password',
								placeholder: 'Enter your password',
								schema: schemas.password,
								class: 'h-12',
								required: true,
								get value() {
									return loginModule.password;
								},

								set value($$value) {
									loginModule.password = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (!loginModule.isPhoneNumber) {
							$$renderer.push(`<!--[0--><div class="flex items-center justify-center gap-2"><div class="flex items-center justify-end">`);

							AuthButton($$renderer, {
								type: 'forgot-password',
								extraqueries: { email: loginModule.identifier },
								children: ($$renderer) => {
									Button($$renderer, {
										variant: 'link',
										class: '-mr-4 text-sm text-gray-600 hover:text-gray-500',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Forgot password?`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						Button($$renderer, {
							type: 'submit',
							class: 'mt-2 h-14 w-full text-wrap px-4 py-2 text-base font-semibold shadow-sm transition-colors',
							disabled: userState.loading || loginModule.isLoading,
							children: ($$renderer) => {
								if (loginModule.isPhoneNumber && (loginModule.isLoading || userState.loading)) {
									$$renderer.push('<!--[0-->');
									LoaderIcon($$renderer, { class: 'mr-2 h-5 w-5 animate-spin' });
									$$renderer.push(`<!----> Sending OTP...`);
								} else if (userState.loading && !loginModule.isPhoneNumber) {
									$$renderer.push('<!--[1-->');
									LoaderIcon($$renderer, { class: 'mr-2 h-5 w-5 animate-spin' });
									$$renderer.push(`<!----> Signing in...`);
								} else {
									$$renderer.push(`<!--[-1-->${$.escape(loginModule.isPhoneNumber ? 'Send OTP' : 'Sign In')}`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (loginModule.showSignupButton && page.data.store?.loginType !== 'PHONE') {
							$$renderer.push(`<!--[0--><div class="pt-2 text-center"><p class="text-sm text-gray-500 dark:text-gray-400">New to ${$.escape(page?.data?.store?.name)}? `);

							AuthButton($$renderer, {
								type: 'signup',
								class: 'ml-1 font-semibold text-gray-900 hover:underline dark:text-white',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Create an account`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></p></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div class="space-y-1 pt-1.5 text-center text-xs leading-5 text-gray-500 dark:text-gray-400"><p>By continuing, you agree to our <a href="/terms-and-conditions" class="font-medium text-gray-700 hover:underline dark:text-gray-300">Terms &amp; Conditions</a></p> `);

						if (page?.data?.store?.plugins?.isMultiVendor?.active) {
							$$renderer.push(`<!--[0--><div class="pt-0.5"><a href="/auth/join-as-vendor" class="font-medium text-gray-600 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white">Join as a Vendor</a></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div></form>`);
					} else if (loginModule.step === 2) {
						$$renderer.push(`<!--[1--><div class="flex min-h-[min(540px,100dvh)] flex-col py-1 sm:min-h-0"><div class="flex items-center justify-between"><button type="button" class="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">`);
						ArrowLeft($$renderer, { class: 'h-4 w-4' });
						$$renderer.push(`<!----> Change number</button> <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">`);
						Check($$renderer, { class: 'h-3.5 w-3.5 text-primary' });
						$$renderer.push(`<!----> Code sent</span></div> <div class="mt-10 space-y-2 text-center sm:mt-8"><h2 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Check your phone</h2> <p class="text-sm leading-6 text-gray-600 dark:text-gray-300">Enter the 4-digit code sent to <span class="font-semibold text-gray-950 dark:text-white">${$.escape(recipient())}</span>.</p> `);

						if (dev) {
							$$renderer.push(`<!--[0--><p class="text-xs font-semibold text-amber-700 dark:text-amber-300">Dev mode: use 1111</p>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-1 items-center justify-center py-10 sm:py-8">`);

						{
							function children($$renderer, { cells }) {
								if (InputOTP.Group) {
									$$renderer.push('<!--[-->');

									InputOTP.Group($$renderer, {
										class: 'gap-2.5 sm:gap-3',
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(cells);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let cell = each_array[$$index];

												if (InputOTP.Slot) {
													$$renderer.push('<!--[-->');

													InputOTP.Slot($$renderer, {
														cell,
														class: `h-14 w-12 rounded-md border border-gray-300 bg-white text-xl font-bold shadow-sm transition-colors dark:border-gray-600 dark:bg-gray-900 ${cell.isActive ? 'border-primary ring-2 ring-primary/35' : ''}`
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
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

							if (InputOTP.Root) {
								$$renderer.push('<!--[-->');

								InputOTP.Root($$renderer, {
									'aria-label': 'Four digit verification code',
									maxlength: 4,
									pattern: '\\d*',
									get value() {
										return loginModule.otp;
									},

									set value($$value) {
										loginModule.otp = $$value;
										$$settled = false;
									},

									get ref() {
										return loginModule.otpInputRef;
									},

									set ref($$value) {
										loginModule.otpInputRef = $$value;
										$$settled = false;
									},
									children,
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(`</div> <input type="hidden" name="otp"${$.attr('value', loginModule.otp)}/> <div class="space-y-4 text-center">`);

						Button($$renderer, {
							class: 'h-12 w-full text-base font-semibold shadow-sm',
							onclick: loginModule.handleVerifyOtp,
							disabled: loginModule.otp.length !== 4 || userState.loading,
							children: ($$renderer) => {
								if (userState.loading) {
									$$renderer.push('<!--[0-->');
									LoaderIcon($$renderer, { class: 'mr-2 h-5 w-5 animate-spin' });
									$$renderer.push(`<!----> Verifying...`);
								} else {
									$$renderer.push(`<!--[-1-->Continue`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <p class="text-sm text-gray-600 dark:text-gray-300">`);

						if (resendSeconds > 0) {
							$$renderer.push(`<!--[0-->Resend code in ${$.escape(resendSeconds)}s`);
						} else {
							$$renderer.push(`<!--[-1-->Didn't get it? <button type="button" class="min-h-11 font-semibold text-gray-950 underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-white">Resend code</button>`);
						}

						$$renderer.push(`<!--]--></p></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
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
		$.bind_props($$props, { show });
	});
}