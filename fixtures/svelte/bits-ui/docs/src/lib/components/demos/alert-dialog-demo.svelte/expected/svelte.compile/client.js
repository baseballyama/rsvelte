import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AlertDialog } from "bits-ui";

var root = $.from_html(`<div class="flex flex-col gap-4 pb-6"><!> <!></div> <div class="flex w-full items-center justify-center gap-2"><!> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Alert_dialog_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
					AlertDialog_Trigger($$anchor, {
						class: 'rounded-input bg-dark text-background\n	shadow-mini hover:bg-dark/95 inline-flex h-12 select-none\n	items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-all active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Subscribe');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => AlertDialog.Portal, ($$anchor, AlertDialog_Portal) => {
					AlertDialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => AlertDialog.Overlay, ($$anchor, AlertDialog_Overlay) => {
								AlertDialog_Overlay($$anchor, {
									class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80'
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
								AlertDialog_Content($$anchor, {
									class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border p-7 sm:max-w-lg md:w-full ',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var div = $.first_child(fragment_3);
										var node_5 = $.child(div);

										$.component(node_5, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												class: 'text-lg font-semibold tracking-tight',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Confirm your transaction');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												class: 'text-foreground-alt text-sm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('This action cannot be undone. This will initiate a monthly wire in the amount of\n					$10,000 to Huntabyte. Do you wish to continue?');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div);

										var div_1 = $.sibling(div, 2);
										var node_7 = $.child(div_1);

										$.component(node_7, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												class: 'h-input rounded-input bg-muted shadow-mini hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex w-full items-center justify-center text-[15px] font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Cancel');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												class: 'h-input rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex w-full items-center justify-center text-[15px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Continue');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_1);
										$.append($$anchor, fragment_3);
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
}