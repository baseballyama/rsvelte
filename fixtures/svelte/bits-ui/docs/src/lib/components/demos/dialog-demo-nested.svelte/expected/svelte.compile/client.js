import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import X from "phosphor-svelte/lib/X";
import { Dialog } from "bits-ui";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <span class="sr-only">Close</span></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Dialog_demo_nested($$anchor) {
	let rootOpen = $.state(false);
	let nestedOpen = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(rootOpen);
			},

			set open($$value) {
				$.set(rootOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
					Dialog_Trigger($$anchor, {
						class: 'rounded-input bg-dark text-background\n	shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden\n	inline-flex h-12 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Open First Dialog');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
					Dialog_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
								Dialog_Overlay($$anchor, {
									class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-nested:hidden fixed inset-0 z-50 bg-black/80 transition-opacity duration-200'
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
								Dialog_Content($$anchor, {
									class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[calc(-50%+var(--bits-dialog-nested-count)*-1.5rem)] scale-[calc(1-var(--bits-dialog-nested-count)*0.05)] border p-6 transition-all duration-200 sm:max-w-[500px] md:w-full',
									style: 'filter: blur(calc(var(--bits-dialog-nested-count) * 1px));',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_3();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'mb-2 text-lg font-semibold tracking-tight',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('First Dialog');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'text-foreground-alt mb-6 text-sm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('This is the first dialog in the nested dialog stack.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
											Dialog_Root_1($$anchor, {
												get open() {
													return $.get(nestedOpen);
												},

												set open($$value) {
													$.set(nestedOpen, $$value, true);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_8 = $.first_child(fragment_4);

													$.component(node_8, () => Dialog.Trigger, ($$anchor, Dialog_Trigger_1) => {
														Dialog_Trigger_1($$anchor, {
															class: 'rounded-input bg-dark text-background\n				shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden\n				inline-flex h-12 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Open Second Dialog');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Dialog.Portal, ($$anchor, Dialog_Portal_1) => {
														Dialog_Portal_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root_1();
																var node_10 = $.first_child(fragment_5);

																$.component(node_10, () => Dialog.Overlay, ($$anchor, Dialog_Overlay_1) => {
																	Dialog_Overlay_1($$anchor, {
																		class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-nested:hidden fixed inset-0 z-50 bg-black/80 transition-opacity duration-200'
																	});
																});

																var node_11 = $.sibling(node_10, 2);

																$.component(node_11, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
																	Dialog_Content_1($$anchor, {
																		class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[calc(-50%+var(--bits-dialog-nested-count)*-1rem)] scale-[calc(1-var(--bits-dialog-nested-count)*0.05)] border p-6 transition-all duration-200 sm:max-w-[500px] md:w-full',
																		style: 'filter: blur(calc(var(--bits-dialog-nested-count) * 1.5px));',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root();
																			var node_12 = $.first_child(fragment_6);

																			$.component(node_12, () => Dialog.Title, ($$anchor, Dialog_Title_1) => {
																				Dialog_Title_1($$anchor, {
																					class: 'mb-2 text-lg font-semibold tracking-tight',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text('Second Dialog');

																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_13 = $.sibling(node_12, 2);

																			$.component(node_13, () => Dialog.Description, ($$anchor, Dialog_Description_1) => {
																				Dialog_Description_1($$anchor, {
																					class: 'text-foreground-alt mb-6 text-sm',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text('This is the second dialog in the nested dialog stack.');

																						$.append($$anchor, text_5);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_14 = $.sibling(node_13, 2);

																			$.component(node_14, () => Dialog.Close, ($$anchor, Dialog_Close) => {
																				Dialog_Close($$anchor, {
																					class: 'rounded-input bg-dark text-background\n	shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden\n	inline-flex h-12 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_6 = $.text('Close Second Dialog');

																						$.append($$anchor, text_6);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_6);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_7, 2);

										$.component(node_15, () => Dialog.Close, ($$anchor, Dialog_Close_1) => {
											Dialog_Close_1($$anchor, {
												class: 'focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden absolute right-5 top-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
												children: ($$anchor, $$slotProps) => {
													var div = root_2();
													var node_16 = $.child(div);

													X(node_16, { class: 'text-foreground size-5' });
													$.next(2);
													$.reset(div);
													$.append($$anchor, div);
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