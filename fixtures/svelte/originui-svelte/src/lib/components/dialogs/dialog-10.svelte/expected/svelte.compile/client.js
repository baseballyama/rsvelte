import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Textarea from '$lib/components/ui/textarea.svelte';
import * as Dialog from '$lib/components/ui/dialog';

var root = $.from_html(
	`Watch <a class="text-foreground hover:underline" href="#title">tutorials</a>, read Origin
				UI&lsquo;s <a class="text-foreground hover:underline" href="#title">documentation</a>, or join our <a class="text-foreground hover:underline" href="#title">Discord</a> for community help.`,
	1
);

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <form class="space-y-5"><!> <div class="flex flex-col sm:flex-row sm:justify-end"><!></div></form>`, 1);

export default function Dialog_10($$anchor, $$props) {
	$.push($$props, true);

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

								var text = $.text('Feedback');

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
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Send us feedback');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_4 = root();

													$.next(6);
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

							var form = $.sibling(node_3, 2);
							var node_6 = $.child(form);

							Textarea(node_6, {
								id: 'feedback',
								placeholder: 'How can we improve Origin UI?',
								'aria-label': 'Send feedback'
							});

							var div = $.sibling(node_6, 2);
							var node_7 = $.child(div);

							Button(node_7, {
								type: 'button',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Send feedback');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.reset(div);
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