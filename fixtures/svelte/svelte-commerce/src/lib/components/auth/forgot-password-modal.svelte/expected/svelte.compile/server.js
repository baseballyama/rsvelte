import * as $ from 'svelte/internal/server';
import { ArrowLeft, CheckCircle2, LoaderIcon, Mail, ShieldCheck, X } from '@lucide/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import Textbox from '$lib/components/form/textbox.svelte';
import Modal from '$lib/components/common/modal.svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { ForgotPasswordModule, forgotPasswordSchema as schemas } from '$lib/core/composables/index.js';
import { page } from '$app/state';

export default function Forgot_password_modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = void 0, manageHistory = true } = $$props;
		const forgotPasswordModule = new ForgotPasswordModule();

		function closeModal() {
			show = false;
			forgotPasswordModule.success = false;
			forgotPasswordModule.removeUrlParams();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('18o2uua', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Forgot Password</title>`);
				});
			});

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
					if (!forgotPasswordModule.success) {
						$$renderer.push(`<!--[0--><div class="w-full transform space-y-6 border border-gray-100/50 bg-white p-6 shadow-2xl ring-1 ring-white/20 transition-all dark:border-gray-700 dark:bg-gray-900 dark:ring-white/5 max-sm:min-h-[100dvh] max-sm:px-5 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-[max(1rem,env(safe-area-inset-top))] sm:max-w-[480px] sm:rounded-radius sm:p-8"><div class="z-50 flex min-h-11 items-center justify-between sm:absolute sm:right-5 sm:top-5 sm:justify-end">`);

						AuthButton($$renderer, {
							type: 'login',
							children: ($$renderer) => {
								Button($$renderer, {
									type: 'button',
									variant: 'ghost',
									class: '-ml-3 inline-flex min-h-11 items-center gap-1.5 px-3 text-sm font-semibold text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white sm:hidden',
									children: ($$renderer) => {
										ArrowLeft($$renderer, { class: 'h-4 w-4' });
										$$renderer.push(`<!----> Login`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <button aria-label="Close modal button" class="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">`);
						X($$renderer, { class: 'h-5 w-5' });
						$$renderer.push(`<!----></button></div> <div class="flex flex-col items-center space-y-3 pb-1 text-center max-sm:pt-5">`);

						if (page?.data?.store?.logo) {
							$$renderer.push(`<!--[0--><div class="mb-1 flex h-10 items-center justify-center"><img${$.attr('src', page.data.store.logo)}${$.attr('alt', page.data.store.name)} class="h-9 object-contain dark:brightness-110"/></div>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="mb-1 flex h-12 w-12 items-center justify-center rounded-radius bg-muted shadow-sm ring-1 ring-border"><span class="text-lg font-bold text-gray-900 dark:text-white">${$.escape(page?.data?.store?.name?.charAt(0) || 'L')}</span></div>`);
						}

						$$renderer.push(`<!--]--> <div class="space-y-2"><div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">`);
						ShieldCheck($$renderer, { class: 'h-6 w-6' });
						$$renderer.push(`<!----></div> <h1 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Reset password</h1> <p class="mx-auto max-w-[31ch] text-sm leading-6 text-gray-600 dark:text-gray-300">Enter your account email and we’ll send a secure reset link.</p></div></div> <form class="space-y-5 max-sm:pt-2">`);

						Textbox($$renderer, {
							name: 'email',
							type: 'email',
							placeholder: 'you@example.com',
							schema: schemas.email,
							label: 'Email address',
							class: 'h-14 text-base',
							required: true,
							get value() {
								return forgotPasswordModule.email;
							},

							set value($$value) {
								forgotPasswordModule.email = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							type: 'submit',
							class: 'h-14 w-full text-wrap px-4 py-2 text-base font-semibold shadow-sm transition-colors',
							disabled: forgotPasswordModule.isLoading,
							children: ($$renderer) => {
								if (forgotPasswordModule.isLoading) {
									$$renderer.push('<!--[0-->');
									LoaderIcon($$renderer, { class: 'mr-2 h-5 w-5 animate-spin' });
									$$renderer.push(`<!----> Sending reset link...`);
								} else {
									$$renderer.push(`<!--[-1-->Send reset link`);
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></form> <div class="rounded-radius bg-gray-50 p-3 text-sm leading-5 text-gray-600 ring-1 ring-gray-100 dark:bg-gray-800/70 dark:text-gray-300 dark:ring-gray-700">For your security, the reset link may expire after a short time. Check spam if it doesn’t arrive.</div> <div class="hidden text-center sm:block">`);

						AuthButton($$renderer, {
							type: 'login',
							children: ($$renderer) => {
								Button($$renderer, {
									variant: 'link',
									class: 'inline-flex min-h-11 items-center text-sm font-semibold text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white',
									children: ($$renderer) => {
										ArrowLeft($$renderer, { class: 'mr-2 h-4 w-4' });
										$$renderer.push(`<!----> Back to login`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="w-full transform space-y-6 border border-gray-100/50 bg-white p-6 shadow-2xl ring-1 ring-white/20 transition-all dark:border-gray-700 dark:bg-gray-900 dark:ring-white/5 max-sm:flex max-sm:min-h-[100dvh] max-sm:flex-col max-sm:justify-center max-sm:px-5 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-[max(1rem,env(safe-area-inset-top))] sm:max-w-[480px] sm:rounded-radius sm:p-8"><div class="z-50 flex min-h-11 items-center justify-end sm:absolute sm:right-5 sm:top-5"><button aria-label="Close modal button" class="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">`);
						X($$renderer, { class: 'h-5 w-5' });
						$$renderer.push(`<!----></button></div> <div class="w-full space-y-6 text-center"><div class="flex flex-col items-center space-y-4"><div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">`);
						Mail($$renderer, { class: 'h-7 w-7' });
						$$renderer.push(`<!----> <span class="absolute -right-1 -top-1 rounded-full bg-white text-primary shadow-sm dark:bg-gray-900">`);
						CheckCircle2($$renderer, { class: 'h-6 w-6' });
						$$renderer.push(`<!----></span></div> <div class="space-y-2"><h1 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Check your email</h1> <p class="mx-auto max-w-[33ch] text-sm leading-6 text-gray-600 dark:text-gray-300">We sent a password reset link to <span class="font-semibold text-gray-950 dark:text-white">${$.escape(forgotPasswordModule.email)}</span>.</p></div></div> <div class="rounded-radius bg-gray-50 p-3 text-sm leading-5 text-gray-600 ring-1 ring-gray-100 dark:bg-gray-800/70 dark:text-gray-300 dark:ring-gray-700">The link may take a minute to arrive. If you don’t see it, check spam or try again.</div> <div class="space-y-3">`);

						AuthButton($$renderer, {
							type: 'login',
							children: ($$renderer) => {
								Button($$renderer, {
									class: 'h-12 w-full text-base font-semibold',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Back to login`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							variant: 'ghost',
							class: 'min-h-11 w-full text-sm font-semibold',
							onclick: () => forgotPasswordModule.success = false,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Use a different email`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
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