import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArrowLeft, Check, LoaderIcon, ShieldCheck, UserPlus, X } from '@lucide/svelte';
import Button from '$lib/components/ui/button/button.svelte';
import Textbox from '$lib/components/form/textbox.svelte';
import Modal from '../common/modal.svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { SignupRenderer } from '$lib/core/composables/index.js';
import { page } from '$app/state';

var root = $.from_html(`<!> Login`, 1);
var root_1 = $.from_html(`<div class="mb-1 flex h-10 items-center justify-center"><img class="h-9 object-contain dark:brightness-110"/></div>`);
var root_2 = $.from_html(`<div class="mb-1 flex h-12 w-12 items-center justify-center rounded-radius bg-muted shadow-sm ring-1 ring-border"><span class="text-lg font-bold text-gray-900 dark:text-white"> </span></div>`);
var root_3 = $.from_html(`<!> <span>Passwords do not match yet.</span>`, 1);
var root_4 = $.from_html(`<!> <span>Use at least 8 characters. Your password is only used to secure your account.</span>`, 1);
var root_5 = $.from_html(`<!> Creating account...`, 1);
var root_6 = $.from_html(`<!> Sign in`, 1);
var root_7 = $.from_html(`<div class="relative py-4"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200 dark:border-gray-700"></div></div> <div class="relative flex justify-center text-sm"><span class="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">or</span></div></div> <a href="/auth/join-as-vendor" class="inline-flex min-h-12 w-full items-center justify-center rounded-radius border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white" aria-label="Join as a vendor"><!> Join as a Vendor</a>`, 1);
var root_8 = $.from_html(`<div class="flex max-h-[100dvh] w-full transform flex-col overflow-y-auto border border-gray-100/50 bg-white p-6 shadow-2xl ring-1 ring-white/20 transition-all dark:border-gray-700 dark:bg-gray-900 dark:ring-white/5 max-sm:min-h-[100dvh] max-sm:px-5 max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] max-sm:pt-[max(1rem,env(safe-area-inset-top))] sm:max-h-[92vh] sm:max-w-[480px] sm:rounded-radius sm:p-8"><div class="z-50 flex min-h-11 shrink-0 items-center justify-between sm:absolute sm:right-5 sm:top-5 sm:justify-end"><!> <button aria-label="Close modal button" class="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"><!></button></div> <div class="flex shrink-0 flex-col items-center space-y-3 pb-1 text-center max-sm:pt-3"><!> <div class="space-y-2"><div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15"><!></div> <h1 class="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Create account</h1> <p class="mx-auto max-w-[31ch] text-sm leading-6 text-gray-600 dark:text-gray-300">Save your details for faster checkout and easier order tracking.</p></div></div> <form class="space-y-4 max-sm:pt-2" aria-label="Sign up form"><div class="grid grid-cols-1 gap-4 sm:grid-cols-2"><!> <!></div> <!> <!> <!> <div class="flex items-start gap-2 rounded-radius bg-gray-50 p-3 text-xs leading-5 text-gray-600 ring-1 ring-gray-100 dark:bg-gray-800/70 dark:text-gray-300 dark:ring-gray-700"><!></div> <!></form> <div class="space-y-2 text-center"><p class="text-sm text-gray-600 dark:text-gray-300">Already have an account?</p> <!></div> <!></div>`);

export default function Signup_modal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15),
		manageHistory = $.prop($$props, 'manageHistory', 3, true);

	let info = $.state($.proxy({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: ''
	}));

	const passwordsMismatch = $.derived(() => $.get(info).confirmPassword.length > 0 && $.get(info).password !== $.get(info).confirmPassword);

	{
		const content = ($$anchor, $$arg0) => {
			let isLoading = () => ($$arg0?.()).isLoading;
			let handleSubmit = () => ($$arg0?.()).handleSubmit;
			let closeModal = () => ($$arg0?.()).closeModal;
			let schemas = () => ($$arg0?.()).schemas;

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
					var div = root_8();
					var div_1 = $.child(div);
					var node = $.child(div_1);

					AuthButton(node, {
						type: 'login',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								type: 'button',
								variant: 'ghost',
								class: '-ml-3 inline-flex min-h-11 items-center gap-1.5 px-3 text-sm font-semibold text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white sm:hidden',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_1 = $.first_child(fragment_3);

									ArrowLeft(node_1, { class: 'h-4 w-4' });
									$.next();
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var button = $.sibling(node, 2);
					var node_2 = $.child(button);

					X(node_2, { class: 'h-5 w-5' });
					$.reset(button);
					$.reset(div_1);

					var div_2 = $.sibling(div_1, 2);
					var node_3 = $.child(div_2);

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

						$.if(node_3, ($$render) => {
							if (page?.data?.store?.logo) $$render(consequent); else $$render(alternate, -1);
						});
					}

					var div_5 = $.sibling(node_3, 2);
					var div_6 = $.child(div_5);
					var node_4 = $.child(div_6);

					UserPlus(node_4, { class: 'h-6 w-6' });
					$.reset(div_6);
					$.next(4);
					$.reset(div_5);
					$.reset(div_2);

					var form = $.sibling(div_2, 2);
					var div_7 = $.child(form);
					var node_5 = $.child(div_7);

					Textbox(node_5, {
						name: 'firstName',
						placeholder: 'John',
						get schema() {
							return schemas().firstName;
						},
						label: 'First name',
						class: 'h-14 text-base sm:h-12',
						required: true,
						'aria-label': 'First name',
						autocomplete: 'given-name',
						get value() {
							return $.get(info).firstName;
						},

						set value($$value) {
							$.get(info).firstName = $$value;
						}
					});

					var node_6 = $.sibling(node_5, 2);

					Textbox(node_6, {
						name: 'lastName',
						placeholder: 'Doe',
						get schema() {
							return schemas().lastName;
						},
						label: 'Last name',
						class: 'h-14 text-base sm:h-12',
						required: true,
						'aria-label': 'Last name',
						autocomplete: 'family-name',
						get value() {
							return $.get(info).lastName;
						},

						set value($$value) {
							$.get(info).lastName = $$value;
						}
					});

					$.reset(div_7);

					var node_7 = $.sibling(div_7, 2);

					Textbox(node_7, {
						name: 'email',
						type: 'email',
						placeholder: 'you@example.com',
						get schema() {
							return schemas().email;
						},
						label: 'Email address',
						class: 'h-14 text-base sm:h-12',
						required: true,
						'aria-label': 'Email address',
						autocomplete: 'email',
						get value() {
							return $.get(info).email;
						},

						set value($$value) {
							$.get(info).email = $$value;
						}
					});

					var node_8 = $.sibling(node_7, 2);

					Textbox(node_8, {
						name: 'password',
						type: 'password',
						placeholder: 'Enter a password',
						get schema() {
							return schemas().password;
						},
						label: 'Password',
						class: 'h-14 text-base sm:h-12',
						required: true,
						'aria-label': 'Password',
						autocomplete: 'new-password',
						get value() {
							return $.get(info).password;
						},

						set value($$value) {
							$.get(info).password = $$value;
						}
					});

					var node_9 = $.sibling(node_8, 2);

					Textbox(node_9, {
						name: 'confirmPassword',
						type: 'password',
						placeholder: 'Confirm your password',
						get schema() {
							return schemas().confirmPassword;
						},
						label: 'Confirm password',
						class: 'h-14 text-base sm:h-12',
						required: true,
						'aria-label': 'Confirm password',
						autocomplete: 'new-password',
						get value() {
							return $.get(info).confirmPassword;
						},

						set value($$value) {
							$.get(info).confirmPassword = $$value;
						}
					});

					var div_8 = $.sibling(node_9, 2);
					var node_10 = $.child(div_8);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_4 = root_3();
							var node_11 = $.first_child(fragment_4);

							X(node_11, { class: 'mt-0.5 h-4 w-4 shrink-0 text-destructive' });
							$.next(2);
							$.append($$anchor, fragment_4);
						};

						var alternate_1 = ($$anchor) => {
							var fragment_5 = root_4();
							var node_12 = $.first_child(fragment_5);

							ShieldCheck(node_12, { class: 'mt-0.5 h-4 w-4 shrink-0 text-primary' });
							$.next(2);
							$.append($$anchor, fragment_5);
						};

						$.if(node_10, ($$render) => {
							if ($.get(passwordsMismatch)) $$render(consequent_1); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_8);

					var node_13 = $.sibling(div_8, 2);

					{
						let $0 = $.derived(() => isLoading() || $.get(passwordsMismatch));

						let $1 = $.derived(() => isLoading()
							? 'Creating account...'
							: $.get(passwordsMismatch) ? 'Passwords do not match' : 'Create account');

						Button(node_13, {
							type: 'submit',
							class: 'h-14 w-full text-wrap px-4 py-2 text-base font-semibold shadow-sm transition-colors',
							get disabled() {
								return $.get($0);
							},

							get 'aria-label'() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_14 = $.first_child(fragment_6);

								{
									var consequent_2 = ($$anchor) => {
										var fragment_7 = root_5();
										var node_15 = $.first_child(fragment_7);

										LoaderIcon(node_15, { class: 'mr-2 h-5 w-5 animate-spin', 'aria-hidden': 'true' });
										$.next();
										$.append($$anchor, fragment_7);
									};

									var consequent_3 = ($$anchor) => {
										var text_1 = $.text('Passwords do not match');

										$.append($$anchor, text_1);
									};

									var alternate_2 = ($$anchor) => {
										var text_2 = $.text('Create account');

										$.append($$anchor, text_2);
									};

									$.if(node_14, ($$render) => {
										if (isLoading()) $$render(consequent_2); else if ($.get(passwordsMismatch)) $$render(consequent_3, 1); else $$render(alternate_2, -1);
									});
								}

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					}

					$.reset(form);

					var div_9 = $.sibling(form, 2);
					var node_16 = $.sibling($.child(div_9), 2);

					AuthButton(node_16, {
						type: 'login',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'link',
								class: 'inline-flex min-h-11 items-center font-semibold text-gray-950 transition-colors hover:underline dark:text-white',
								'aria-label': 'Sign in to your account',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_6();
									var node_17 = $.first_child(fragment_9);

									ArrowLeft(node_17, { class: 'mr-2 h-4 w-4' });
									$.next();
									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.reset(div_9);

					var node_18 = $.sibling(div_9, 2);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_10 = root_7();
							var a = $.sibling($.first_child(fragment_10), 2);
							var node_19 = $.child(a);

							Check(node_19, { class: 'mr-2 h-4 w-4' });
							$.next();
							$.reset(a);
							$.append($$anchor, fragment_10);
						};

						$.if(node_18, ($$render) => {
							if (page?.data?.store?.plugins?.isMultiVendor?.active) $$render(consequent_4);
						});
					}

					$.reset(div);

					$.delegated('click', button, function (...$$args) {
						closeModal()?.apply(this, $$args);
					});

					$.event('submit', form, function (...$$args) {
						handleSubmit()?.apply(this, $$args);
					});

					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		SignupRenderer($$anchor, {
			get show() {
				return show();
			},

			set show($$value) {
				show($$value);
			},

			get info() {
				return $.get(info);
			},

			set info($$value) {
				$.set(info, $$value, true);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}

$.delegate(['click']);