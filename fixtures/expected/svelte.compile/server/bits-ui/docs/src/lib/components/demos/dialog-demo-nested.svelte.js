import * as $ from 'svelte/internal/server';
import X from "phosphor-svelte/lib/X";
import { Dialog } from "bits-ui";

export default function Dialog_demo_nested($$renderer) {
	let rootOpen = false;
	let nestedOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Dialog.Root) {
			$$renderer.push('<!--[-->');

			Dialog.Root($$renderer, {
				get open() {
					return rootOpen;
				},

				set open($$value) {
					rootOpen = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Dialog.Trigger) {
						$$renderer.push('<!--[-->');

						Dialog.Trigger($$renderer, {
							class: 'rounded-input bg-dark text-background\n	shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden\n	inline-flex h-12 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open First Dialog`);
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
										class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-nested:hidden fixed inset-0 z-50 bg-black/80 transition-opacity duration-200'
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
										class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[calc(-50%+var(--bits-dialog-nested-count)*-1.5rem)] scale-[calc(1-var(--bits-dialog-nested-count)*0.05)] border p-6 transition-all duration-200 sm:max-w-[500px] md:w-full',
										style: 'filter: blur(calc(var(--bits-dialog-nested-count) * 1px));',
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'mb-2 text-lg font-semibold tracking-tight',
													children: ($$renderer) => {
														$$renderer.push(`<!---->First Dialog`);
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
													class: 'text-foreground-alt mb-6 text-sm',
													children: ($$renderer) => {
														$$renderer.push(`<!---->This is the first dialog in the nested dialog stack.`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Dialog.Root) {
												$$renderer.push('<!--[-->');

												Dialog.Root($$renderer, {
													get open() {
														return nestedOpen;
													},

													set open($$value) {
														nestedOpen = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Dialog.Trigger) {
															$$renderer.push('<!--[-->');

															Dialog.Trigger($$renderer, {
																class: 'rounded-input bg-dark text-background\n				shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden\n				inline-flex h-12 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Open Second Dialog`);
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
																			class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-nested:hidden fixed inset-0 z-50 bg-black/80 transition-opacity duration-200'
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
																			class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[calc(-50%+var(--bits-dialog-nested-count)*-1rem)] scale-[calc(1-var(--bits-dialog-nested-count)*0.05)] border p-6 transition-all duration-200 sm:max-w-[500px] md:w-full',
																			style: 'filter: blur(calc(var(--bits-dialog-nested-count) * 1.5px));',
																			children: ($$renderer) => {
																				if (Dialog.Title) {
																					$$renderer.push('<!--[-->');

																					Dialog.Title($$renderer, {
																						class: 'mb-2 text-lg font-semibold tracking-tight',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Second Dialog`);
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
																						class: 'text-foreground-alt mb-6 text-sm',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->This is the second dialog in the nested dialog stack.`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Dialog.Close) {
																					$$renderer.push('<!--[-->');

																					Dialog.Close($$renderer, {
																						class: 'rounded-input bg-dark text-background\n	shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden\n	inline-flex h-12 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Close Second Dialog`);
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

											$$renderer.push(` `);

											if (Dialog.Close) {
												$$renderer.push('<!--[-->');

												Dialog.Close($$renderer, {
													class: 'focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden absolute right-5 top-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
													children: ($$renderer) => {
														$$renderer.push(`<div>`);
														X($$renderer, { class: 'text-foreground size-5' });
														$$renderer.push(`<!----> <span class="sr-only">Close</span></div>`);
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