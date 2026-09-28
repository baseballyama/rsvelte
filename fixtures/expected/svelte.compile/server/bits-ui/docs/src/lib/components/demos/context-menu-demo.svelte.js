import * as $ from 'svelte/internal/server';
import { ContextMenu } from "bits-ui";
import CopySimple from "phosphor-svelte/lib/CopySimple";
import MouseSimple from "phosphor-svelte/lib/MouseSimple";
import PencilSimpleLine from "phosphor-svelte/lib/PencilSimpleLine";
import PlusCircle from "phosphor-svelte/lib/PlusCircle";
import Trash from "phosphor-svelte/lib/Trash";

export default function Context_menu_demo($$renderer) {
	if (ContextMenu.Root) {
		$$renderer.push('<!--[-->');

		ContextMenu.Root($$renderer, {
			children: ($$renderer) => {
				if (ContextMenu.Trigger) {
					$$renderer.push('<!--[-->');

					ContextMenu.Trigger($$renderer, {
						class: 'rounded-card border-border-input text-muted-foreground flex h-[188px] w-[279px] select-none items-center justify-center border-2 border-dashed bg-transparent font-semibold',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex flex-col items-center justify-center gap-4 text-center">`);
							MouseSimple($$renderer, { class: 'size-8' });
							$$renderer.push(`<!----> Right click me</div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (ContextMenu.Portal) {
					$$renderer.push('<!--[-->');

					ContextMenu.Portal($$renderer, {
						children: ($$renderer) => {
							if (ContextMenu.Content) {
								$$renderer.push('<!--[-->');

								ContextMenu.Content($$renderer, {
									class: 'border-muted bg-background shadow-popover w-[229px] rounded-xl border px-1 py-1.5 outline-none focus-visible:outline-none',
									children: ($$renderer) => {
										if (ContextMenu.Item) {
											$$renderer.push('<!--[-->');

											ContextMenu.Item($$renderer, {
												class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex items-center">`);
													PencilSimpleLine($$renderer, { class: 'text-foreground-alt mr-2 size-5' });
													$$renderer.push(`<!----> Edit</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[13px]">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[11px]">E</kbd></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (ContextMenu.Sub) {
											$$renderer.push('<!--[-->');

											ContextMenu.Sub($$renderer, {
												children: ($$renderer) => {
													if (ContextMenu.SubTrigger) {
														$$renderer.push('<!--[-->');

														ContextMenu.SubTrigger($$renderer, {
															class: 'rounded-button data-highlighted:bg-muted data-[state=open]:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
															children: ($$renderer) => {
																$$renderer.push(`<div class="flex items-center">`);
																PlusCircle($$renderer, { class: 'text-foreground-alt mr-2 size-5' });
																$$renderer.push(`<!----> Add</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[13px]">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[11px]">N</kbd></div>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (ContextMenu.SubContent) {
														$$renderer.push('<!--[-->');

														ContextMenu.SubContent($$renderer, {
															class: 'border-muted bg-background shadow-popover z-100 ring-0! ring-transparent! w-[209px] rounded-xl border px-1 py-1.5',
															sideOffset: 10,
															children: ($$renderer) => {
																if (ContextMenu.Item) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.Item($$renderer, {
																		class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-normal focus-visible:outline-none',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Header`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (ContextMenu.Item) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.Item($$renderer, {
																		class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-normal focus-visible:outline-none',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Paragraph`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (ContextMenu.Item) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.Item($$renderer, {
																		class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-normal focus-visible:outline-none',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Codeblock`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (ContextMenu.Item) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.Item($$renderer, {
																		class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-normal focus-visible:outline-none',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->List`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (ContextMenu.Item) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.Item($$renderer, {
																		class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-normal focus-visible:outline-none',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Task`);
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

										if (ContextMenu.Item) {
											$$renderer.push('<!--[-->');

											ContextMenu.Item($$renderer, {
												class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex items-center">`);
													CopySimple($$renderer, { class: 'text-foreground-alt mr-2 size-5' });
													$$renderer.push(`<!----> Duplicate</div> <div class="ml-auto flex items-center gap-px"><kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[13px]">⌘</kbd> <kbd class="rounded-button border-dark-10 bg-background-alt text-muted-foreground shadow-kbd inline-flex size-5 items-center justify-center border text-[11px]">D</kbd></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (ContextMenu.Separator) {
											$$renderer.push('<!--[-->');
											ContextMenu.Separator($$renderer, { class: 'bg-muted -mx-1 my-1 block h-px' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (ContextMenu.Item) {
											$$renderer.push('<!--[-->');

											ContextMenu.Item($$renderer, {
												class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
												children: ($$renderer) => {
													$$renderer.push(`<div class="flex items-center">`);
													Trash($$renderer, { class: 'text-foreground-alt mr-2 size-5' });
													$$renderer.push(`<!----> Delete</div>`);
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