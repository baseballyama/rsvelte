import * as $ from 'svelte/internal/server';
import { Command, Dialog } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import CodeBlock from "phosphor-svelte/lib/CodeBlock";
import Palette from "phosphor-svelte/lib/Palette";
import RadioButton from "phosphor-svelte/lib/RadioButton";
import Sticker from "phosphor-svelte/lib/Sticker";
import Textbox from "phosphor-svelte/lib/Textbox";

export default function Command_demo_dialog($$renderer) {
	let dialogOpen = false;

	function handleKeydown(e) {
		if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			dialogOpen = true;
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Dialog.Root) {
			$$renderer.push('<!--[-->');

			Dialog.Root($$renderer, {
				get open() {
					return dialogOpen;
				},

				set open($$value) {
					dialogOpen = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Dialog.Trigger) {
						$$renderer.push('<!--[-->');

						Dialog.Trigger($$renderer, {
							class: 'rounded-input bg-dark text-background\n	shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex\n	h-12 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open Command Menu ⌘J`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Dialog.Portal) {
						$$renderer.push('<!--[-->');

						Dialog.Portal($$renderer, {
							children: ($$renderer) => {
								if (Dialog.Overlay) {
									$$renderer.push('<!--[-->');

									Dialog.Overlay($$renderer, {
										class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80'
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Dialog.Content) {
									$$renderer.push('<!--[-->');

									Dialog.Content($$renderer, {
										class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95  data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[94%] translate-x-[-50%] translate-y-[-50%] sm:max-w-[490px] md:w-full',
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'sr-only',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Command Menu`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Dialog.Description) {
												$$renderer.push('<!--[-->');

												Dialog.Description($$renderer, {
													class: 'sr-only',
													children: ($$renderer) => {
														$$renderer.push(`<!---->This is the command menu. Use the arrow keys to navigate and press ⌘K to open the
				search bar.`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Command.Root) {
												$$renderer.push('<!--[-->');

												Command.Root($$renderer, {
													class: 'divide-border border-muted bg-background flex h-full w-full flex-col divide-y self-start overflow-hidden rounded-xl border',
													children: ($$renderer) => {
														if (Command.Input) {
															$$renderer.push('<!--[-->');

															Command.Input($$renderer, {
																class: 'focus-override h-input bg-background placeholder:text-foreground-alt/50 focus:outline-hidden inline-flex truncate rounded-xl px-4 text-sm transition-colors focus:ring-0',
																placeholder: 'Search for something...'
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Command.List) {
															$$renderer.push('<!--[-->');

															Command.List($$renderer, {
																class: 'max-h-[280px] overflow-y-auto overflow-x-hidden px-2 pb-2',
																children: ($$renderer) => {
																	if (Command.Viewport) {
																		$$renderer.push('<!--[-->');

																		Command.Viewport($$renderer, {
																			children: ($$renderer) => {
																				if (Command.Empty) {
																					$$renderer.push('<!--[-->');

																					Command.Empty($$renderer, {
																						class: 'text-muted-foreground flex w-full items-center justify-center pb-6 pt-8 text-sm',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->No results found.`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Command.Group) {
																					$$renderer.push('<!--[-->');

																					Command.Group($$renderer, {
																						children: ($$renderer) => {
																							if (Command.GroupHeading) {
																								$$renderer.push('<!--[-->');

																								Command.GroupHeading($$renderer, {
																									class: 'text-muted-foreground px-3 pb-2 pt-4 text-xs',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Suggestions`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Command.GroupItems) {
																								$$renderer.push('<!--[-->');

																								Command.GroupItems($$renderer, {
																									children: ($$renderer) => {
																										if (Command.Item) {
																											$$renderer.push('<!--[-->');

																											Command.Item($$renderer, {
																												class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																												keywords: ["getting started", "tutorial"],
																												children: ($$renderer) => {
																													Sticker($$renderer, { class: 'size-4' });
																													$$renderer.push(`<!----> Introduction`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Command.Item) {
																											$$renderer.push('<!--[-->');

																											Command.Item($$renderer, {
																												class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																												keywords: ["child", "custom element", "snippets"],
																												children: ($$renderer) => {
																													CodeBlock($$renderer, { class: 'size-4 ' });
																													$$renderer.push(`<!----> Delegation`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Command.Item) {
																											$$renderer.push('<!--[-->');

																											Command.Item($$renderer, {
																												class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																												keywords: ["css", "theme", "colors", "fonts", "tailwind"],
																												children: ($$renderer) => {
																													Palette($$renderer, { class: 'size-4' });
																													$$renderer.push(`<!----> Styling`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Command.Separator) {
																					$$renderer.push('<!--[-->');
																					Command.Separator($$renderer, {});
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Command.Group) {
																					$$renderer.push('<!--[-->');

																					Command.Group($$renderer, {
																						children: ($$renderer) => {
																							if (Command.GroupHeading) {
																								$$renderer.push('<!--[-->');

																								Command.GroupHeading($$renderer, {
																									class: 'text-muted-foreground px-3 pb-2 pt-4 text-xs',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Components`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Command.GroupItems) {
																								$$renderer.push('<!--[-->');

																								Command.GroupItems($$renderer, {
																									children: ($$renderer) => {
																										if (Command.Item) {
																											$$renderer.push('<!--[-->');

																											Command.Item($$renderer, {
																												class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																												keywords: ["dates", "times"],
																												children: ($$renderer) => {
																													CalendarBlank($$renderer, { class: 'size-4' });
																													$$renderer.push(`<!----> Calendar`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Command.Item) {
																											$$renderer.push('<!--[-->');

																											Command.Item($$renderer, {
																												class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																												keywords: ["buttons", "forms"],
																												children: ($$renderer) => {
																													RadioButton($$renderer, { class: 'size-4' });
																													$$renderer.push(`<!----> Radio Group`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Command.Item) {
																											$$renderer.push('<!--[-->');

																											Command.Item($$renderer, {
																												class: 'rounded-button data-selected:bg-muted outline-hidden flex h-10 cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm capitalize',
																												keywords: ["inputs", "text", "autocomplete"],
																												children: ($$renderer) => {
																													Textbox($$renderer, { class: 'size-4' });
																													$$renderer.push(`<!----> Combobox`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}