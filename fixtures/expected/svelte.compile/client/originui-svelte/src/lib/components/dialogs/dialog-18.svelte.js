import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import Check from '@lucide/svelte/icons/check';
import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
import * as Dialog from '$lib/components/ui/dialog';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-lg border px-4 py-3 shadow-xs shadow-black/5"><!> <div class="grid grow gap-1"><!> <p id="plan-01-description" class="text-muted-foreground text-xs">$4 per member/month</p></div></div> <div class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-lg border px-4 py-3 shadow-xs shadow-black/5"><!> <div class="grid grow gap-1"><!> <p id="plan-02-description" class="text-muted-foreground text-xs">$19 per member/month</p></div></div> <div class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-lg border px-4 py-3 shadow-xs shadow-black/5"><!> <div class="grid grow gap-1"><!> <p id="plan-03-description" class="text-muted-foreground text-xs">$32 per member/month</p></div></div>`, 1);
var root_2 = $.from_html(`<div class="mb-2 flex flex-col gap-2"><div class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border" aria-hidden="true"><!></div> <!></div> <form class="space-y-5"><!> <div class="space-y-3"><p><strong class="text-sm font-medium">Features include:</strong></p> <ul class="text-muted-foreground space-y-2 text-sm"><li class="flex gap-2"><!> Create unlimited projects.</li> <li class="flex gap-2"><!> Remove watermarks.</li> <li class="flex gap-2"><!> Add unlimited users and free viewers.</li> <li class="flex gap-2"><!> Upload unlimited files.</li> <li class="flex gap-2"><!> 7-day money back guarantee.</li> <li class="flex gap-2"><!> Advanced permissions.</li></ul></div> <div class="grid gap-2"><!> <!></div></form>`, 1);

export default function Dialog_18($$anchor, $$props) {
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

								var text = $.text('Change plan');

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

							RefreshCcw(node_3, { class: 'opacity-80', size: 16 });
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

													var text_1 = $.text('Change your plan');

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

													var text_2 = $.text('Pick one of the following plans.');

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
							var node_7 = $.child(form);

							RadioGroup(node_7, {
								class: 'gap-2',
								value: 'plan-02',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var div_2 = $.first_child(fragment_4);
									var node_8 = $.child(div_2);

									RadioGroupItem(node_8, {
										value: 'plan-01',
										id: 'plan-01',
										'aria-describedby': 'plan-01-description',
										class: 'order-1 after:absolute after:inset-0'
									});

									var div_3 = $.sibling(node_8, 2);
									var node_9 = $.child(div_3);

									Label(node_9, {
										for: 'plan-01',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Essential');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_3);
									$.reset(div_2);

									var div_4 = $.sibling(div_2, 2);
									var node_10 = $.child(div_4);

									RadioGroupItem(node_10, {
										value: 'plan-02',
										id: 'plan-02',
										'aria-describedby': 'plan-02-description',
										class: 'order-1 after:absolute after:inset-0'
									});

									var div_5 = $.sibling(node_10, 2);
									var node_11 = $.child(div_5);

									Label(node_11, {
										for: 'plan-02',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Standard');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_5);
									$.reset(div_4);

									var div_6 = $.sibling(div_4, 2);
									var node_12 = $.child(div_6);

									RadioGroupItem(node_12, {
										value: 'plan-03',
										id: 'plan-03',
										'aria-describedby': 'plan-03-description',
										class: 'order-1 after:absolute after:inset-0'
									});

									var div_7 = $.sibling(node_12, 2);
									var node_13 = $.child(div_7);

									Label(node_13, {
										for: 'plan-03',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Enterprise');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div_7);
									$.reset(div_6);
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							var div_8 = $.sibling(node_7, 2);
							var ul = $.sibling($.child(div_8), 2);
							var li = $.child(ul);
							var node_14 = $.child(li);

							Check(node_14, {
								size: 16,
								class: 'text-primary mt-0.5 shrink-0',
								'aria-hidden': 'true'
							});

							$.next();
							$.reset(li);

							var li_1 = $.sibling(li, 2);
							var node_15 = $.child(li_1);

							Check(node_15, {
								size: 16,
								class: 'text-primary mt-0.5 shrink-0',
								'aria-hidden': 'true'
							});

							$.next();
							$.reset(li_1);

							var li_2 = $.sibling(li_1, 2);
							var node_16 = $.child(li_2);

							Check(node_16, {
								size: 16,
								class: 'text-primary mt-0.5 shrink-0',
								'aria-hidden': 'true'
							});

							$.next();
							$.reset(li_2);

							var li_3 = $.sibling(li_2, 2);
							var node_17 = $.child(li_3);

							Check(node_17, {
								size: 16,
								class: 'text-primary mt-0.5 shrink-0',
								'aria-hidden': 'true'
							});

							$.next();
							$.reset(li_3);

							var li_4 = $.sibling(li_3, 2);
							var node_18 = $.child(li_4);

							Check(node_18, {
								size: 16,
								class: 'text-primary mt-0.5 shrink-0',
								'aria-hidden': 'true'
							});

							$.next();
							$.reset(li_4);

							var li_5 = $.sibling(li_4, 2);
							var node_19 = $.child(li_5);

							Check(node_19, {
								size: 16,
								class: 'text-primary mt-0.5 shrink-0',
								'aria-hidden': 'true'
							});

							$.next();
							$.reset(li_5);
							$.reset(ul);
							$.reset(div_8);

							var div_9 = $.sibling(div_8, 2);
							var node_20 = $.child(div_9);

							Button(node_20, {
								type: 'button',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('Change plan');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_20, 2);

							{
								let $0 = $.derived(() => buttonVariants({ variant: 'ghost' }));

								$.component(node_21, () => Dialog.Close, ($$anchor, Dialog_Close) => {
									Dialog_Close($$anchor, {
										get class() {
											return `${$.get($0) ?? ''} w-full`;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Cancel');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});
								});
							}

							$.reset(div_9);
							$.reset(form);
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