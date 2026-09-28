import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import CircleAlert from '@lucide/svelte/icons/circle-alert';
import * as Dialog from '$lib/components/ui/dialog';
import { PROJECT_NAME } from '$lib/config';

var root = $.from_html(`This action cannot be undone. To confirm, please enter the project name <span class="text-foreground"> </span>.`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col items-center gap-2"><div class="border-border flex size-9 shrink-0 items-center justify-center rounded-full border" aria-hidden="true"><!></div> <!></div> <form class="space-y-5"><div class="space-y-2"><!> <!></div> <!></form>`, 1);

export default function Dialog_08($$anchor, $$props) {
	$.push($$props, true);

	let inputValue = $.state('');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
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

								var text = $.text('Delete project');

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

							CircleAlert(node_3, { class: 'opacity-80', size: 16 });
							$.reset(div_1);

							var node_4 = $.sibling(div_1, 2);

							$.component(node_4, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'sm:text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Final confirmation');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'sm:text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_4 = root();
													var span = $.sibling($.first_child(fragment_4));
													var text_2 = $.only_child(span, true);

													$.next();
													$.template_effect(() => $.set_text(text_2, PROJECT_NAME));
													$.append($$anchor, fragment_4);
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
							var node_7 = $.child(div_2);

							Label(node_7, {
								for: 'project-name',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Project name');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							Input(node_8, {
								id: 'project-name',
								type: 'text',
								get placeholder() {
									return `Type ${PROJECT_NAME ?? ''} to confirm`;
								},

								get value() {
									return $.get(inputValue);
								},

								set value($$value) {
									$.set(inputValue, $$value, true);
								}
							});

							$.reset(div_2);

							var node_9 = $.sibling(div_2, 2);

							$.component(node_9, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_10 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => buttonVariants({ variant: 'outline' }));

											$.component(node_10, () => Dialog.Close, ($$anchor, Dialog_Close) => {
												Dialog_Close($$anchor, {
													get class() {
														return `${$.get($0) ?? ''} flex-1`;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Cancel');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_11 = $.sibling(node_10, 2);

										{
											let $0 = $.derived(() => $.get(inputValue) !== PROJECT_NAME);

											Button(node_11, {
												type: 'button',
												class: 'flex-1',
												get disabled() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Delete');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

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