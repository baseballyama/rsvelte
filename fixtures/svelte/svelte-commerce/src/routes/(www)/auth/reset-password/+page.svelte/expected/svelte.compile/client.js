import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center space-x-2 text-red-600" role="alert"><!> <span class="text-sm"> </span></div>`);
var root_2 = $.from_html(`<!> Loading...`, 1);
var root_3 = $.from_html(`<form><div class="space-y-4"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div> <!> <!></div></form>`);
var root_4 = $.from_html(`<div class="space-y-4 text-center"><p class="text-green-600">Password reset link sent! Check your email.</p> <!></div>`);
var root_5 = $.from_html(`<button class="flex items-center text-sm text-muted-foreground hover:text-primary"><!> Back to Login</button>`);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const resetPasswordModule = new ResetPasswordModule();
	const userState = resetPasswordModule.userState;

	// The composable's handleSubmit takes no event, never sets isLoading and never catches, so
	// wrap it here: stop the native GET submit, block double-submits and surface failures inline.
	let submitting = $.state(false);

	let error = $.state('');

	async function handleSubmit(e) {
		e.preventDefault();

		if ($.get(submitting)) return;

		$.set(submitting, true);
		$.set(error, '');

		try {
			await resetPasswordModule.handleSubmit();
		} catch(err) {
			$.set(error, err?.message || 'We could not reset your password. The link may have expired — request a new one.', true);
		} finally {
			$.set(submitting, false);
		}
	}

	$.head('12zq6ye', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Reset Password';
		});
	});

	Card($$anchor, {
		class: 'mx-auto w-full max-w-md',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					CardTitle(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Reset Password');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Enter your new password to set.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CardContent(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					{
						var consequent_2 = ($$anchor) => {
							var form = root_3();
							var div = $.child(form);
							var div_1 = $.child(div);
							var node_5 = $.child(div_1);

							Label(node_5, {
								for: 'password',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('New Password');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => !!userState.loading);

								Input(node_6, {
									id: 'password',
									placeholder: '********',
									type: 'password',
									get disabled() {
										return $.get($0);
									},
									class: 'bg-white text-gray-900 dark:bg-gray-700 dark:text-white',
									get value() {
										return resetPasswordModule.password;
									},

									set value($$value) {
										resetPasswordModule.password = $$value;
									}
								});
							}

							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_7 = $.child(div_2);

							Label(node_7, {
								for: 'retypepassword',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Confirm Password');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							{
								let $0 = $.derived(() => !!userState.loading);

								Input(node_8, {
									id: 'retypepassword',
									placeholder: '********',
									type: 'password',
									get disabled() {
										return $.get($0);
									},
									class: 'bg-white text-gray-900 dark:bg-gray-700 dark:text-white',
									get value() {
										return resetPasswordModule.retype;
									},

									set value($$value) {
										resetPasswordModule.retype = $$value;
									}
								});
							}

							$.reset(div_2);

							var node_9 = $.sibling(div_2, 2);

							{
								var consequent = ($$anchor) => {
									var div_3 = root_1();
									var node_10 = $.child(div_3);

									AlertCircle(node_10, { size: 16 });

									var span = $.sibling(node_10, 2);
									var text_4 = $.only_child(span, true);

									$.reset(div_3);
									$.template_effect(() => $.set_text(text_4, $.get(error) || resetPasswordModule.error));
									$.append($$anchor, div_3);
								};

								$.if(node_9, ($$render) => {
									if ($.get(error) || resetPasswordModule.error) $$render(consequent);
								});
							}

							var node_11 = $.sibling(node_9, 2);

							Button(node_11, {
								type: 'submit',
								class: 'w-full',
								get disabled() {
									return $.get(submitting);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_12 = $.first_child(fragment_4);

									{
										var consequent_1 = ($$anchor) => {
											var fragment_5 = root_2();
											var node_13 = $.first_child(fragment_5);

											LoaderIcon(node_13, { class: 'mr-2 h-4 w-4 animate-spin' });
											$.next();
											$.append($$anchor, fragment_5);
										};

										var alternate = ($$anchor) => {
											var text_5 = $.text('Reset Password');

											$.append($$anchor, text_5);
										};

										$.if(node_12, ($$render) => {
											if ($.get(submitting)) $$render(consequent_1); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							$.reset(div);
							$.reset(form);
							$.event('submit', form, handleSubmit);
							$.append($$anchor, form);
						};

						var alternate_1 = ($$anchor) => {
							var div_4 = root_4();
							var node_14 = $.sibling($.child(div_4), 2);

							Button(node_14, {
								variant: 'outline',
								class: 'w-full',
								onclick: () => resetPasswordModule.success = false,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Send another link');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							$.reset(div_4);
							$.append($$anchor, div_4);
						};

						$.if(node_4, ($$render) => {
							if (!resetPasswordModule.success) $$render(consequent_2); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_3, 2);

			CardFooter(node_15, {
				children: ($$anchor, $$slotProps) => {
					AuthButton($$anchor, {
						type: 'login',
						children: ($$anchor, $$slotProps) => {
							var button = root_5();
							var node_16 = $.child(button);

							ArrowLeft(node_16, { size: 16, class: 'mr-2' });
							$.next();
							$.reset(button);
							$.append($$anchor, button);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}