import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';
import UserRoundPlus from '@lucide/svelte/icons/user-round-plus';
import * as Dialog from '$lib/components/ui/dialog';
import { cn } from '$lib/utils';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<button><div><!></div> <div><!></div></button>`);
var root_2 = $.from_html(`<div class="flex flex-col gap-2"><div class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border" aria-hidden="true"><!></div> <!></div> <form class="space-y-5"><div class="space-y-4"><div class="space-y-2"><!> <div class="space-y-3"></div></div> <button type="button" class="text-sm underline hover:no-underline">+ Add another</button></div> <!></form> <hr class="border-border my-1 border-t"/> <div class="space-y-2"><!> <div class="relative"><!> <!></div></div>`, 1);

export default function Dialog_15($$anchor, $$props) {
	$.push($$props, true);

	let input = $.state(null);
	let emails = $.proxy(['mark@yourcompany.com', 'jane@yourcompany.com', '']);
	let copied = $.state(false);

	function addEmail() {
		emails.push('');
	}

	function handleCopy() {
		navigator.clipboard.writeText($.get(input).value);
		$.set(copied, true);
		setTimeout(() => $.set(copied, false), 1500);
	}

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

								var text = $.text('Invite members');

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
							var fragment_2 = root_2();
							var div = $.first_child(fragment_2);
							var div_1 = $.child(div);
							var node_3 = $.child(div_1);

							UserRoundPlus(node_3, { class: 'opacity-80', size: 16 });
							$.reset(div_1);

							var node_4 = $.sibling(div_1, 2);

							$.component(node_4, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'text-left',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Invite team members');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'text-left',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Invite teammates to earn free components.');

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
							var div_2 = $.child(form);
							var div_3 = $.child(div_2);
							var node_7 = $.child(div_3);

							Label(node_7, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Invite via email');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var div_4 = $.sibling(node_7, 2);

							$.each(div_4, 21, () => emails, $.index, ($$anchor, _, index) => {
								Input($$anchor, {
									id: `team-email-${index + 1}`,
									placeholder: 'hi@yourcompany.com',
									type: 'email',
									get value() {
										return emails[index];
									},

									set value($$value) {
										emails[index] = $$value;
									}
								});
							});

							$.reset(div_4);
							$.reset(div_3);

							var button = $.sibling(div_3, 2);

							$.reset(div_2);

							var node_8 = $.sibling(div_2, 2);

							Button(node_8, {
								type: 'button',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Send invites');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.reset(form);

							var div_5 = $.sibling(form, 4);
							var node_9 = $.child(div_5);

							Label(node_9, {
								for: 'input-53',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Invite via magic link');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							var div_6 = $.sibling(node_9, 2);
							var node_10 = $.child(div_6);

							Input(node_10, {
								id: 'input-53',
								class: 'pe-9',
								type: 'text',
								value: 'https://originui.com/refer/87689',
								readonly: true,
								get ref() {
									return $.get(input);
								},

								set ref($$value) {
									$.set(input, $$value, true);
								}
							});

							var node_11 = $.sibling(node_10, 2);

							TooltipProvider(node_11, {
								delayDuration: 0,
								children: ($$anchor, $$slotProps) => {
									Tooltip($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var node_12 = $.first_child(fragment_6);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;
													var button_1 = root_1();

													$.attribute_effect(button_1, () => ({
														...props(),
														onclick: handleCopy,
														class: 'text-muted-foreground/80 hover:text-foreground focus-visible:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-solid disabled:pointer-events-none disabled:cursor-not-allowed',
														'aria-label': $.get(copied) ? 'Copied' : 'Copy to clipboard',
														disabled: $.get(copied)
													}));

													var div_7 = $.child(button_1);
													var node_13 = $.child(div_7);

													Check(node_13, { class: 'stroke-emerald-500', size: 16, 'aria-hidden': 'true' });
													$.reset(div_7);

													var div_8 = $.sibling(div_7, 2);
													var node_14 = $.child(div_8);

													Copy(node_14, { size: 16, 'aria-hidden': 'true' });
													$.reset(div_8);
													$.reset(button_1);

													$.template_effect(
														($0, $1) => {
															$.set_class(div_7, 1, $0);
															$.set_class(div_8, 1, $1);
														},
														[
															() => $.clsx(cn('transition-all', $.get(copied) ? 'scale-100 opacity-100' : 'scale-0 opacity-0')),
															() => $.clsx(cn('absolute transition-all', $.get(copied) ? 'scale-0 opacity-0' : 'scale-100 opacity-100'))
														]
													);

													$.append($$anchor, button_1);
												};

												TooltipTrigger(node_12, { child, $$slots: { child: true } });
											}

											var node_15 = $.sibling(node_12, 2);

											TooltipContent(node_15, {
												class: 'px-2 py-1 text-xs',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Copy to clipboard');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.reset(div_6);
							$.reset(div_5);
							$.delegated('click', button, addEmail);
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

$.delegate(['click']);