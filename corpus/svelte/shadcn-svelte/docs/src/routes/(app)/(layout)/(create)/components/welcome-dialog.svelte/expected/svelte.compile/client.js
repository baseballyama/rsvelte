import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PersistedState } from "runed";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import Logo from "$lib/components/logo.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex aspect-[2/1.2] w-full items-center justify-center rounded-t-xl bg-neutral-950 text-center text-neutral-100 sm:aspect-2/1"><div class="font-mono text-2xl font-bold"><!></div></div> <!> <!>`, 1);

export default function Welcome_dialog($$anchor, $$props) {
	$.push($$props, true);

	const dismissed = new PersistedState("shadcn-create-welcome-dialog", false);
	var fragment = $.comment();
	var node = $.first_child(fragment);
	var bind_get = () => !dismissed.current;
	var bind_set = (v) => dismissed.current = !v;

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return bind_get();
			},

			set open($$value) {
				bind_set($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						showCloseButton: false,
						class: 'dialog-ring max-w-92 min-w-0 gap-0 overflow-hidden rounded-xl p-0 sm:max-w-sm dark:bg-neutral-900',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var div = $.first_child(fragment_2);
							var div_1 = $.child(div);
							var node_2 = $.child(div_1);

							Logo(node_2, { class: 'size-12' });
							$.reset(div_1);
							$.reset(div);

							var node_3 = $.sibling(div, 2);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									class: 'gap-1 p-4',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'text-left text-base',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Build your own shadcn-svelte');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'text-left leading-relaxed text-foreground',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Customize everything from the ground up. Pick your component library, font, color scheme,\n				and more.');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Dialog.Description, ($$anchor, Dialog_Description_1) => {
											Dialog_Description_1($$anchor, {
												class: 'mt-2 text-left leading-relaxed font-medium text-foreground',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Available for SvelteKit, Vite, and Astro.');

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

							var node_7 = $.sibling(node_3, 2);

							$.component(node_7, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									class: 'm-0',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_8 = $.first_child(fragment_4);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props({ class: 'w-full rounded-lg shadow-none' }, props, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Get Started');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_8, () => Dialog.Close, ($$anchor, Dialog_Close) => {
												Dialog_Close($$anchor, { child, $$slots: { child: true } });
											});
										}

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