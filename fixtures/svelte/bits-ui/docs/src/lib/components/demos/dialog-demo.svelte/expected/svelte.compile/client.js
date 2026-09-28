import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog, Label, Separator } from "bits-ui";
import LockKeyOpen from "phosphor-svelte/lib/LockKeyOpen";
import X from "phosphor-svelte/lib/X";

var root = $.from_html(`<div><!> <span class="sr-only">Close</span></div>`);
var root_1 = $.from_html(`<!> <!> <!> <div class="flex flex-col items-start gap-1 pb-11 pt-7"><!> <div class="relative w-full"><input id="apiKey" class="h-input rounded-card-sm border-border-input bg-background placeholder:text-foreground-alt/50 hover:border-dark-40 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex w-full items-center border px-4 text-base focus:ring-2 focus:ring-offset-2 sm:text-sm" placeholder="secret_api_key" name="name"/> <!></div></div> <div class="flex w-full justify-end"><!></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Dialog_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
						class: 'rounded-input bg-dark text-background\n	  shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden\n	  inline-flex h-12 items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('New API key');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
					Dialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
								Dialog_Overlay($$anchor, {
									class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80'
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, {
									class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border p-5 sm:max-w-[490px] md:w-full',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'flex w-full items-center justify-center text-lg font-semibold tracking-tight',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Create API key');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Separator.Root, ($$anchor, Separator_Root) => {
											Separator_Root($$anchor, { class: 'bg-muted -mx-5 mb-6 mt-5 block h-px' });
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'text-foreground-alt text-sm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Create and manage API keys. You can create multiple keys to organize your\n				applications.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var div = $.sibling(node_7, 2);
										var node_8 = $.child(div);

										$.component(node_8, () => Label.Root, ($$anchor, Label_Root) => {
											Label_Root($$anchor, {
												for: 'apiKey',
												class: 'text-sm font-medium',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('API Key');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var div_1 = $.sibling(node_8, 2);
										var node_9 = $.sibling($.child(div_1), 2);

										LockKeyOpen(node_9, {
											class: 'text-dark/30 absolute right-4 top-[14px] size-[22px]'
										});

										$.reset(div_1);
										$.reset(div);

										var div_2 = $.sibling(div, 2);
										var node_10 = $.child(div_2);

										$.component(node_10, () => Dialog.Close, ($$anchor, Dialog_Close) => {
											Dialog_Close($$anchor, {
												class: 'h-input rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex items-center justify-center px-[50px] text-[15px] font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Save');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_2);

										var node_11 = $.sibling(div_2, 2);

										$.component(node_11, () => Dialog.Close, ($$anchor, Dialog_Close_1) => {
											Dialog_Close_1($$anchor, {
												class: 'focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden absolute right-5 top-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
												children: ($$anchor, $$slotProps) => {
													var div_3 = root();
													var node_12 = $.child(div_3);

													X(node_12, { class: 'text-foreground size-5' });
													$.next(2);
													$.reset(div_3);
													$.append($$anchor, div_3);
												},
												$$slots: { default: true }
											});
										});

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