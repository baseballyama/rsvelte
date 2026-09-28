import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import * as Dialog from '$lib/components/ui/dialog';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-2"><div class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border" aria-hidden="true"><svg class="stroke-svelte size-6" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke-width="2"></circle><circle cx="16" cy="16" r="9" fill="none" stroke-width="2"></circle></svg></div> <!></div> <form class="space-y-5"><div class="space-y-4"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <!></form> <div class="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1"><span class="text-muted-foreground text-xs">Or</span></div> <!> <p class="text-muted-foreground text-center text-xs">By signing up you agree to our <a class="underline hover:no-underline" href="#title">Terms</a>.</p>`, 1);

export default function Dialog_13($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: 'outline' }));

					$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
						Dialog_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Sign up');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var div = $.first_child(fragment_2);
							var node_3 = $.sibling($.child(div), 2);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'sm:text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Sign up Origin UI');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'sm:text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('We just need a few details to get you started.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);

							var form = $.sibling(div, 2);
							var div_1 = $.child(form);
							var div_2 = $.child(div_1);
							var node_6 = $.child(div_2);

							Label(node_6, {
								for: 'signup-name',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Full name');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Input(node_7, {
								id: 'signup-name',
								placeholder: 'Matt Welsh',
								type: 'text',
								required: true
							});

							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var node_8 = $.child(div_3);

							Label(node_8, {
								for: 'signup-email',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Email');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Input(node_9, {
								id: 'signup-email',
								placeholder: 'hi@yourcompany.com',
								type: 'email',
								required: true
							});

							$.reset(div_3);

							var div_4 = $.sibling(div_3, 2);
							var node_10 = $.child(div_4);

							Label(node_10, {
								for: 'signup-password',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Password');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_10, 2);

							Input(node_11, {
								id: 'signup-password',
								placeholder: 'Enter your password',
								type: 'password',
								required: true
							});

							$.reset(div_4);
							$.reset(div_1);

							var node_12 = $.sibling(div_1, 2);

							Button(node_12, {
								type: 'button',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Sign up');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							$.reset(form);

							var node_13 = $.sibling(form, 4);

							Button(node_13, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Continue with Google');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							$.next(2);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}