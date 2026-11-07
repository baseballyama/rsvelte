import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import CodeBlock from "phosphor-svelte/lib/CodeBlock";
import Palette from "phosphor-svelte/lib/Palette";
import RadioButton from "phosphor-svelte/lib/RadioButton";
import Sticker from "phosphor-svelte/lib/Sticker";
import Textbox from "phosphor-svelte/lib/Textbox";

export default function Command_demo($$renderer) {
	if (Command.Root) {
		$$renderer.push('<!--[-->');

		Command.Root($$renderer, {
			class: 'divide-border border-muted bg-background flex h-full w-full flex-col divide-y self-start overflow-hidden rounded-xl border',
			children: ($$renderer) => {
				if (Command.Input) {
					$$renderer.push('<!--[-->');

					Command.Input($$renderer, {
						class: 'focus-override h-input placeholder:text-foreground-alt/50 bg-background focus:outline-hidden inline-flex truncate rounded-tl-xl rounded-tr-xl px-4 text-sm transition-colors focus:ring-0',
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
											Command.Separator($$renderer, { class: 'bg-foreground/5 h-px w-full' });
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
}