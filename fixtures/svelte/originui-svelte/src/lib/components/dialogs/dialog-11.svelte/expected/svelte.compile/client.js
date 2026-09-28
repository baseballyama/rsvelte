import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import Textarea from '$lib/components/ui/textarea.svelte';
import * as Dialog from '$lib/components/ui/dialog';

var root = $.from_html(`<label class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:outline-ring/70 relative flex size-9 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm outline-offset-2 transition-colors first:rounded-s-lg last:rounded-e-lg has-focus-visible:outline-2 has-focus-visible:outline-solid has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[state=checked]:z-10"><!> </label>`);
var root_1 = $.from_html(`<!> <div class="px-6 py-4"><form class="space-y-5"><div class="space-y-4"><div><fieldset class="space-y-4"><legend class="text-foreground text-lg leading-none font-semibold">How hard was it to set up your account?</legend> <!></fieldset> <div class="text-muted-foreground mt-2 flex justify-between text-xs"><p>Very easy</p> <p>Very dificult</p></div></div> <div class="space-y-2"><!> <!></div></div> <!></form></div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Dialog_11($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
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

								var text = $.text('Rating');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'flex flex-col gap-0 p-0 [&>button:last-child]:top-3.5',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									class: 'contents space-y-0 text-left',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'border-border border-b px-6 py-4 text-base',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Help us improve');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_3, 2);
							var form = $.child(div);
							var div_1 = $.child(form);
							var div_2 = $.child(div_1);
							var fieldset = $.child(div_2);
							var node_5 = $.sibling($.child(fieldset), 2);

							RadioGroup(node_5, {
								value: '',
								class: 'flex gap-0 -space-x-px rounded-lg shadow-xs shadow-black/5',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_6 = $.first_child(fragment_4);

									$.each(node_6, 16, () => Array.from({ length: 9 }), $.index, ($$anchor, _, index) => {
										var label = root();

										$.set_attribute(label, 'for', `radio-17-r${index}`);

										var node_7 = $.child(label);

										RadioGroupItem(node_7, {
											id: `radio-17-r${index}`,
											value: `r${index}`,
											class: 'sr-only after:absolute after:inset-0'
										});

										var text_2 = $.sibling(node_7);

										text_2.nodeValue = ` ${index}`;
										$.reset(label);
										$.append($$anchor, label);
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							$.reset(fieldset);
							$.next(2);
							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var node_8 = $.child(div_3);

							Label(node_8, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Why did you give this rating?');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Textarea(node_9, {
								id: 'feedback',
								placeholder: 'How can we improve Origin UI?',
								'aria-label': 'Send feedback'
							});

							$.reset(div_3);
							$.reset(div_1);

							var node_10 = $.sibling(div_1, 2);

							Button(node_10, {
								type: 'button',
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Send feedback');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.reset(form);
							$.reset(div);
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