import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonVariants } from '$lib/components/ui/button.svelte';
import CircleAlert from '@lucide/svelte/icons/circle-alert';
import * as AlertDialog from '$lib/components/ui/alert-dialog';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4"><div class="border-border flex size-9 shrink-0 items-center justify-center rounded-full border" aria-hidden="true"><!></div> <!></div> <!>`, 1);

export default function Dialog_02($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: 'outline' }));

					$.component(node_1, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
						AlertDialog_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Alert dialog with icon');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var div = $.first_child(fragment_2);
							var div_1 = $.child(div);
							var node_3 = $.child(div_1);

							CircleAlert(node_3, { class: 'opacity-80', size: 16 });
							$.reset(div_1);

							var node_4 = $.sibling(div_1, 2);

							$.component(node_4, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Are you sure?');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Are you sure you want to delete your account? All your data will be removed.');

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

							var node_7 = $.sibling(div, 2);

							$.component(node_7, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_8 = $.first_child(fragment_4);

										$.component(node_8, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Cancel');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Confirm');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

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