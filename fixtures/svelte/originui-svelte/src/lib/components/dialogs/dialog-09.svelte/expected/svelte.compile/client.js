import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Mail from '@lucide/svelte/icons/mail';
import * as Dialog from '$lib/components/ui/dialog';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="mb-2 flex flex-col items-center gap-2"><div class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border" aria-hidden="true"><svg class="stroke-svelte size-6" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke-width="2"></circle><circle cx="16" cy="16" r="9" fill="none" stroke-width="2"></circle></svg></div> <!></div> <form class="space-y-5"><div class="space-y-2"><div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"><!></div></div></div> <!></form> <p class="text-muted-foreground text-center text-xs">By subscribing you agree to our <a class="underline hover:no-underline" href="#title">Privacy Policy</a>.</p>`, 1);

export default function Dialog_09($$anchor, $$props) {
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

								var text = $.text('Newsletter');

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

													var text_1 = $.text('Never miss an update');

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

													var text_2 = $.text('Subscribe to receive news and special offers.');

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

							Input(node_6, {
								id: 'dialog.-subscribe',
								class: 'peer ps-9',
								placeholder: 'hi@yourcompany.com',
								type: 'email',
								'aria-label': 'Email'
							});

							var div_3 = $.sibling(node_6, 2);
							var node_7 = $.child(div_3);

							Mail(node_7, { size: 16, 'aria-hidden': 'true' });
							$.reset(div_3);
							$.reset(div_2);
							$.reset(div_1);

							var node_8 = $.sibling(div_1, 2);

							Button(node_8, {
								type: 'button',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Subscribe');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.reset(form);
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