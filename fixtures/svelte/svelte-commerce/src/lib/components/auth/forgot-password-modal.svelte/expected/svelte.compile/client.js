import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArrowLeft, CheckCircle2, LoaderIcon, Mail, ShieldCheck, X } from '@lucide/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import Textbox from '$lib/components/form/textbox.svelte';
import Modal from '$lib/components/common/modal.svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { ForgotPasswordModule, forgotPasswordSchema as schemas } from '$lib/core/composables/index.js';
import { page } from '$app/state';

var root = $.from_html(`<!> Login`, 1);
var root_1 = $.from_html(`<div class="mb-1 flex h-10 items-center justify-center"><img class="h-9 object-contain dark:brightness-110"/></div>`);
var root_2 = $.from_html(`<div class="mb-1 flex h-12 w-12 items-center justify-center rounded-radius bg-muted shadow-sm ring-1 ring-border"><span class="text-lg font-bold text-gray-900 dark:text-white"> </span></div>`);
var root_3 = $.from_html(`<!> Sending reset link...`, 1);
var root_4 = $.from_html(`<!> Back to login`, 1);
var root_5 = $.from_html(`<div class="w-full transform space-y-6 border border-gray-100/50 bg-white p-6 shadow-2xl ring-1 ring-white/20 transition-all dark:border-gray-700 dark:bg-gray-900 dark:ring-white/5 max-sm:min-h-[100dvh] max-sm:px-5 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-[max(1rem,env(safe-area-inset-top))] sm:max-w-[480px] sm:rounded-radius sm:p-8"><div class="z-50 flex min-h-11 items-center justify-between sm:absolute sm:right-5 sm:top-5 sm:justify-end"><!> <button aria-label="Close modal button" class="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"><!></button></div> <div class="flex flex-col items-center space-y-3 pb-1 text-center max-sm:pt-5"><!> <div class="space-y-2"><div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15"><!></div> <h1 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Reset password</h1> <p class="mx-auto max-w-[31ch] text-sm leading-6 text-gray-600 dark:text-gray-300">Enter your account email and we’ll send a secure reset link.</p></div></div> <form class="space-y-5 max-sm:pt-2"><!> <!></form> <div class="rounded-radius bg-gray-50 p-3 text-sm leading-5 text-gray-600 ring-1 ring-gray-100 dark:bg-gray-800/70 dark:text-gray-300 dark:ring-gray-700">For your security, the reset link may expire after a short time. Check spam if it doesn’t arrive.</div> <div class="hidden text-center sm:block"><!></div></div>`);
var root_6 = $.from_html(`<div class="w-full transform space-y-6 border border-gray-100/50 bg-white p-6 shadow-2xl ring-1 ring-white/20 transition-all dark:border-gray-700 dark:bg-gray-900 dark:ring-white/5 max-sm:flex max-sm:min-h-[100dvh] max-sm:flex-col max-sm:justify-center max-sm:px-5 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-[max(1rem,env(safe-area-inset-top))] sm:max-w-[480px] sm:rounded-radius sm:p-8"><div class="z-50 flex min-h-11 items-center justify-end sm:absolute sm:right-5 sm:top-5"><button aria-label="Close modal button" class="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"><!></button></div> <div class="w-full space-y-6 text-center"><div class="flex flex-col items-center space-y-4"><div class="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20"><!> <span class="absolute -right-1 -top-1 rounded-full bg-white text-primary shadow-sm dark:bg-gray-900"><!></span></div> <div class="space-y-2"><h1 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Check your email</h1> <p class="mx-auto max-w-[33ch] text-sm leading-6 text-gray-600 dark:text-gray-300">We sent a password reset link to <span class="font-semibold text-gray-950 dark:text-white"> </span>.</p></div></div> <div class="rounded-radius bg-gray-50 p-3 text-sm leading-5 text-gray-600 ring-1 ring-gray-100 dark:bg-gray-800/70 dark:text-gray-300 dark:ring-gray-700">The link may take a minute to arrive. If you don’t see it, check spam or try again.</div> <div class="space-y-3"><!> <!></div></div></div>`);

export default function Forgot_password_modal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15),
		manageHistory = $.prop($$props, 'manageHistory', 3, true);

	const forgotPasswordModule = new ForgotPasswordModule();

	function closeModal() {
		show(false);
		forgotPasswordModule.success = false;
		forgotPasswordModule.removeUrlParams();
	}

	$.head('18o2uua', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Forgot Password';
		});
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
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent_2 = ($$anchor) => {
					var div = root_5();
					var div_1 = $.child(div);
					var node_1 = $.child(div_1);

					AuthButton(node_1, {
						type: 'login',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								type: 'button',
								variant: 'ghost',
								class: '-ml-3 inline-flex min-h-11 items-center gap-1.5 px-3 text-sm font-semibold text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white sm:hidden',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									ArrowLeft(node_2, { class: 'h-4 w-4' });
									$.next();
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var button = $.sibling(node_1, 2);
					var node_3 = $.child(button);

					X(node_3, { class: 'h-5 w-5' });
					$.reset(button);
					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var node_4 = $.child(div_2);

					{
						var consequent = ($$anchor) => {
							var div_3 = root_1();
							var img = $.only_child(div_3);

							$.template_effect(() => {
								$.set_attribute(img, 'src', page.data.store.logo);
								$.set_attribute(img, 'alt', page.data.store.name);
							});

							$.append($$anchor, div_3);
						};

						var alternate = ($$anchor) => {
							var div_4 = root_2();
							var span = $.child(div_4);
							var text = $.only_child(span, true);

							$.reset(div_4);
							$.template_effect(($0) => $.set_text(text, $0), [() => page?.data?.store?.name?.charAt(0) || 'L']);
							$.append($$anchor, div_4);
						};

						$.if(node_4, ($$render) => {
							if (page?.data?.store?.logo) $$render(consequent); else $$render(alternate, -1);
						});
					}

					var div_5 = $.sibling(node_4, 2);
					var div_6 = $.child(div_5);
					var node_5 = $.child(div_6);

					ShieldCheck(node_5, { class: 'h-6 w-6' });
					$.reset(div_6);
					$.next(4);
					$.reset(div_5);
					$.reset(div_2);

					var form = $.sibling(div_2, 2);
					var node_6 = $.child(form);

					Textbox(node_6, {
						name: 'email',
						type: 'email',
						placeholder: 'you@example.com',
						get schema() {
							return schemas.email;
						},
						label: 'Email address',
						class: 'h-14 text-base',
						required: true,
						get value() {
							return forgotPasswordModule.email;
						},

						set value($$value) {
							forgotPasswordModule.email = $$value;
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						type: 'submit',
						class: 'h-14 w-full text-wrap px-4 py-2 text-base font-semibold shadow-sm transition-colors',
						get disabled() {
							return forgotPasswordModule.isLoading;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_8 = $.first_child(fragment_4);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_5 = root_3();
									var node_9 = $.first_child(fragment_5);

									LoaderIcon(node_9, { class: 'mr-2 h-5 w-5 animate-spin' });
									$.next();
									$.append($$anchor, fragment_5);
								};

								var alternate_1 = ($$anchor) => {
									var text_1 = $.text('Send reset link');

									$.append($$anchor, text_1);
								};

								$.if(node_8, ($$render) => {
									if (forgotPasswordModule.isLoading) $$render(consequent_1); else $$render(alternate_1, -1);
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.reset(form);

					var div_7 = $.sibling(form, 4);
					var node_10 = $.child(div_7);

					AuthButton(node_10, {
						type: 'login',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'link',
								class: 'inline-flex min-h-11 items-center text-sm font-semibold text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_4();
									var node_11 = $.first_child(fragment_7);

									ArrowLeft(node_11, { class: 'mr-2 h-4 w-4' });
									$.next();
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.reset(div_7);
					$.reset(div);
					$.delegated('click', button, closeModal);
					$.event('submit', form, (e) => forgotPasswordModule.handleSubmit(e, false));
					$.append($$anchor, div);
				};

				var alternate_2 = ($$anchor) => {
					var div_8 = root_6();
					var div_9 = $.child(div_8);
					var button_1 = $.child(div_9);
					var node_12 = $.child(button_1);

					X(node_12, { class: 'h-5 w-5' });
					$.reset(button_1);
					$.reset(div_9);

					var div_10 = $.sibling(div_9, 2);
					var div_11 = $.child(div_10);
					var div_12 = $.child(div_11);
					var node_13 = $.child(div_12);

					Mail(node_13, { class: 'h-7 w-7' });

					var span_1 = $.sibling(node_13, 2);
					var node_14 = $.child(span_1);

					CheckCircle2(node_14, { class: 'h-6 w-6' });
					$.reset(span_1);
					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var p = $.sibling($.child(div_13), 2);
					var span_2 = $.sibling($.child(p));
					var text_2 = $.only_child(span_2, true);

					$.next();
					$.reset(p);
					$.reset(div_13);
					$.reset(div_11);

					var div_14 = $.sibling(div_11, 4);
					var node_15 = $.child(div_14);

					AuthButton(node_15, {
						type: 'login',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								class: 'h-12 w-full text-base font-semibold',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Back to login');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Button(node_16, {
						variant: 'ghost',
						class: 'min-h-11 w-full text-sm font-semibold',
						onclick: () => forgotPasswordModule.success = false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Use a different email');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.reset(div_14);
					$.reset(div_10);
					$.reset(div_8);
					$.template_effect(() => $.set_text(text_2, forgotPasswordModule.email));
					$.delegated('click', button_1, closeModal);
					$.append($$anchor, div_8);
				};

				$.if(node, ($$render) => {
					if (!forgotPasswordModule.success) $$render(consequent_2); else $$render(alternate_2, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);